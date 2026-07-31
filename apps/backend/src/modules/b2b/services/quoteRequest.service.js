import mongoose from 'mongoose';
import * as quoteRequestRepository from '../repositories/quoteRequest.repository.js';
import * as counterRepository from '../repositories/counter.repository.js';
import { AppError } from '#shared/errors/AppError.js';

// Status constants
export const B2BQuoteStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  VENDOR_SOURCING: 'vendor_sourcing',
  QUOTATION_PREPARATION: 'quotation_preparation',
  QUOTATION_READY: 'quotation_ready',
  REVISION_REQUESTED: 'revision_requested',
  QUOTATION_UPDATED: 'quotation_updated',
  ACCEPTED: 'accepted',
};

export const createQuote = async (payload, agencyId, agencyUserId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentYear = new Date().getFullYear();
    // Fetch and increment sequence atomically within the transaction session
    const seq = await counterRepository.getNextSequenceValue(`quotes_${currentYear}`, { session });
    const reference = `QR-${currentYear}-${String(seq).padStart(6, '0')}`;
    const now = new Date();

    const quoteData = {
      ...payload,
      reference,
      agencyId,
      status: B2BQuoteStatus.SUBMITTED,
      timeline: [
        {
          status: B2BQuoteStatus.SUBMITTED,
          label: 'Submitted',
          description: 'Quote request submitted for operations review.',
          timestamp: now,
          actor: payload.contactPerson.name,
        },
      ],
      createdBy: agencyUserId,
      updatedBy: agencyUserId,
    };

    const quote = await quoteRequestRepository.create(quoteData, { session });

    await session.commitTransaction();
    return quote;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/** Drop undefined / empty-string fields so partial wizard drafts persist cleanly. */
const sanitizeDraftPayload = (payload = {}) => {
  const clean = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'contactPerson' && value && typeof value === 'object') {
      const contact = {};
      for (const [ck, cv] of Object.entries(value)) {
        if (cv === undefined || cv === null || cv === '') continue;
        contact[ck] = cv;
      }
      if (Object.keys(contact).length > 0) clean.contactPerson = contact;
      continue;
    }
    clean[key] = value;
  }
  return clean;
};

export const saveDraft = async (payload, agencyId, agencyUserId, id = null) => {
  const now = new Date();
  const sanitized = sanitizeDraftPayload(payload);

  if (id) {
    // Update existing draft — single document write, transaction not strictly necessary
    const existing = await quoteRequestRepository.findById(id);
    if (!existing) {
      throw new AppError('Quote draft not found', 404);
    }
    const existingAgencyId = existing.agencyId._id
      ? existing.agencyId._id.toString()
      : existing.agencyId.toString();
    if (existingAgencyId !== agencyId.toString()) {
      throw new AppError('Forbidden: Access denied to this quote', 403);
    }
    const editable =
      existing.status === B2BQuoteStatus.DRAFT ||
      existing.status === B2BQuoteStatus.REVISION_REQUESTED;
    if (!editable) {
      throw new AppError('Only draft or needs-changes quotes can be edited', 400);
    }

    // Keep revision_requested until explicit resubmit; drafts stay draft.
    const nextStatus =
      existing.status === B2BQuoteStatus.REVISION_REQUESTED
        ? B2BQuoteStatus.REVISION_REQUESTED
        : B2BQuoteStatus.DRAFT;

    const update = {
      ...sanitized,
      status: nextStatus,
      updatedBy: agencyUserId,
    };
    return await quoteRequestRepository.findOneAndUpdate({ _id: id }, update, {
      new: true,
      runValidators: true,
    });
  }

  // Create new draft with reference number generation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentYear = new Date().getFullYear();
    const seq = await counterRepository.getNextSequenceValue(`quotes_${currentYear}`, { session });
    const reference = `QR-${currentYear}-${String(seq).padStart(6, '0')}`;

    const quoteData = {
      ...sanitized,
      reference,
      agencyId,
      status: B2BQuoteStatus.DRAFT,
      adults: sanitized.adults ?? 1,
      budgetCategory: sanitized.budgetCategory ?? 'standard',
      timeline: [
        {
          status: B2BQuoteStatus.DRAFT,
          label: 'Draft Created',
          description: 'Quote request draft saved.',
          timestamp: now,
          actor: sanitized.contactPerson?.name || 'Agent',
        },
      ],
      createdBy: agencyUserId,
      updatedBy: agencyUserId,
    };

    const quote = await quoteRequestRepository.create(quoteData, { session });

    await session.commitTransaction();
    return quote;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getQuotes = async (filter, sort, page, pageSize) => {
  return await quoteRequestRepository.findSorted(filter, sort, page, pageSize);
};

export const getQuoteById = async (id, agencyId) => {
  const quote = await quoteRequestRepository.findById(id);
  if (!quote) {
    throw new AppError('Quote request not found', 404);
  }
  const existingAgencyId = quote.agencyId._id
    ? quote.agencyId._id.toString()
    : quote.agencyId.toString();
  if (existingAgencyId !== agencyId.toString()) {
    throw new AppError('Forbidden: Access denied to this quote', 403);
  }
  return quote;
};

/** Agency partner: permanently remove a draft quote (ownership + status enforced). */
export const deleteQuote = async (id, agencyId) => {
  const quote = await quoteRequestRepository.findById(id);
  if (!quote) {
    throw new AppError('Quote request not found', 404);
  }
  const existingAgencyId = quote.agencyId._id
    ? quote.agencyId._id.toString()
    : quote.agencyId.toString();
  if (existingAgencyId !== agencyId.toString()) {
    throw new AppError('Forbidden: Access denied to this quote', 403);
  }
  if (quote.status !== B2BQuoteStatus.DRAFT) {
    throw new AppError('Only draft quotes can be deleted', 400);
  }
  await quoteRequestRepository.deleteById(id);
  return { id: String(id), reference: quote.reference };
};

const titleCaseStatus = (status) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * @param {'admin'|'agency'} role
 * @param {string|null} adminFeedback - agency-visible comment (required for admin → revision_requested)
 * @param {string|null} internalNotes - ops-only notes
 */
export const updateQuoteStatus = async (
  id,
  status,
  actor,
  { role = 'admin', adminFeedback = null, internalNotes = null } = {}
) => {
  const quote = await quoteRequestRepository.findById(id);
  if (!quote) {
    throw new AppError('Quote request not found', 404);
  }

  const from = quote.status;
  const to = status;

  if (role === 'agency') {
    const agencyAllowed =
      (from === B2BQuoteStatus.REVISION_REQUESTED && to === B2BQuoteStatus.SUBMITTED) ||
      ([B2BQuoteStatus.QUOTATION_READY, B2BQuoteStatus.QUOTATION_UPDATED].includes(from) &&
        [B2BQuoteStatus.ACCEPTED, B2BQuoteStatus.REVISION_REQUESTED].includes(to));
    if (!agencyAllowed) {
      throw new AppError(`Invalid agency transition from '${from}' to '${to}'`, 400);
    }
    if (from === B2BQuoteStatus.REVISION_REQUESTED && to === B2BQuoteStatus.SUBMITTED) {
      const missing = [];
      if (!quote.destination) missing.push('destination');
      if (!quote.travelStart) missing.push('travelStart');
      if (!quote.travelEnd) missing.push('travelEnd');
      if (!quote.contactPerson?.name) missing.push('contactPerson.name');
      if (!quote.contactPerson?.email) missing.push('contactPerson.email');
      if (!quote.contactPerson?.phone) missing.push('contactPerson.phone');
      if (missing.length) {
        throw new AppError(
          `Cannot resubmit until required fields are complete: ${missing.join(', ')}`,
          400
        );
      }
    }
  } else {
    // Admin review gate + later ops pipeline moves
    const adminGate =
      (from === B2BQuoteStatus.SUBMITTED && to === B2BQuoteStatus.UNDER_REVIEW) ||
      ([B2BQuoteStatus.SUBMITTED, B2BQuoteStatus.UNDER_REVIEW].includes(from) &&
        to === B2BQuoteStatus.REVISION_REQUESTED) ||
      (from === B2BQuoteStatus.REVISION_REQUESTED &&
        [B2BQuoteStatus.UNDER_REVIEW, B2BQuoteStatus.SUBMITTED].includes(to));

    const opsPipeline = [
      B2BQuoteStatus.UNDER_REVIEW,
      B2BQuoteStatus.VENDOR_SOURCING,
      B2BQuoteStatus.QUOTATION_PREPARATION,
      B2BQuoteStatus.QUOTATION_READY,
      B2BQuoteStatus.QUOTATION_UPDATED,
      B2BQuoteStatus.ACCEPTED,
      B2BQuoteStatus.REVISION_REQUESTED,
    ];
    const opsMove = opsPipeline.includes(from) && opsPipeline.includes(to) && from !== to;

    if (!adminGate && !opsMove) {
      throw new AppError(`Invalid admin transition from '${from}' to '${to}'`, 400);
    }

    if (
      to === B2BQuoteStatus.REVISION_REQUESTED &&
      [B2BQuoteStatus.SUBMITTED, B2BQuoteStatus.UNDER_REVIEW].includes(from)
    ) {
      const feedback = (adminFeedback || '').trim();
      if (!feedback) {
        throw new AppError('A comment is required when requesting changes from the agency', 400);
      }
    }
  }

  let description = `Quote status updated to ${titleCaseStatus(to)}.`;
  let label = titleCaseStatus(to);

  if (to === B2BQuoteStatus.UNDER_REVIEW && from === B2BQuoteStatus.SUBMITTED) {
    label = 'Approved';
    description = 'Admin approved this quote request for operations.';
  }
  if (to === B2BQuoteStatus.REVISION_REQUESTED && role === 'admin') {
    label = 'Needs Changes';
    description = (adminFeedback || '').trim() || 'Admin requested changes on this quote request.';
  }
  if (to === B2BQuoteStatus.SUBMITTED && from === B2BQuoteStatus.REVISION_REQUESTED) {
    label = 'Resubmitted';
    description = 'Agency updated the request and resubmitted for review.';
  }
  if (to === B2BQuoteStatus.REVISION_REQUESTED && role === 'agency') {
    label = 'Revision Requested';
    description =
      (internalNotes || '').trim() || 'Agency requested revisions on the prepared quotation.';
  }

  const update = {
    status: to,
    $push: {
      timeline: {
        status: to,
        label,
        description,
        timestamp: new Date(),
        actor,
      },
    },
  };

  if (role === 'admin') {
    if (to === B2BQuoteStatus.REVISION_REQUESTED && adminFeedback != null) {
      update.adminFeedback = String(adminFeedback).trim();
    }
    if (to === B2BQuoteStatus.UNDER_REVIEW || to === B2BQuoteStatus.SUBMITTED) {
      update.adminFeedback = '';
    }
    if (internalNotes !== null && internalNotes !== undefined) {
      update.internalNotes = internalNotes;
    }
  }

  if (role === 'agency' && to === B2BQuoteStatus.SUBMITTED) {
    update.adminFeedback = '';
  }
  if (role === 'agency' && to === B2BQuoteStatus.REVISION_REQUESTED && internalNotes != null) {
    update.internalNotes = internalNotes;
  }

  return await quoteRequestRepository.findOneAndUpdate({ _id: id }, update, {
    new: true,
  });
};

export const getDashboardSummary = async (agencyId) => {
  const filter = { agencyId };
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const agencyObjectId =
    typeof agencyId === 'string' ? new mongoose.Types.ObjectId(agencyId) : agencyId;

  const monthBuckets = [];
  const now = new Date();
  for (let i = 10; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
    });
  }
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 10, 1);

  // Agency-facing status meaning (admin "Approve" → under_review):
  // - Open Requests  = pending admin review (submitted)
  // - Quotes Ready   = quotation ready for agency review
  // - Accepted KPI   = admin-approved pipeline (under_review+) incl. partner accepted
  // - Pending Revisions = needs changes (revision_requested)
  const [
    openRequests,
    submittedToday,
    quotesReady,
    acceptedQuotes,
    pendingRevisions,
    totalQuotes,
    draftCount,
    recentQuotesResponse,
    allQuotesWithTimeline,
    destinationAgg,
    monthlyAgg,
  ] = await Promise.all([
    quoteRequestRepository.countDocuments({
      ...filter,
      status: B2BQuoteStatus.SUBMITTED,
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: { $ne: B2BQuoteStatus.DRAFT },
      createdAt: { $gte: startOfToday },
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: {
        $in: [B2BQuoteStatus.QUOTATION_READY, B2BQuoteStatus.QUOTATION_UPDATED],
      },
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: {
        $in: [
          B2BQuoteStatus.UNDER_REVIEW,
          B2BQuoteStatus.VENDOR_SOURCING,
          B2BQuoteStatus.QUOTATION_PREPARATION,
          B2BQuoteStatus.ACCEPTED,
        ],
      },
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: B2BQuoteStatus.REVISION_REQUESTED,
    }),
    quoteRequestRepository.countDocuments(filter),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: B2BQuoteStatus.DRAFT,
    }),
    quoteRequestRepository.findSorted(filter, { createdAt: -1 }, 1, 5),
    quoteRequestRepository.findSorted(filter, { updatedAt: -1 }, 1, 10),
    quoteRequestRepository.aggregate([
      { $match: { agencyId: agencyObjectId } },
      {
        $group: {
          _id: { $ifNull: ['$destination', 'Unknown'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    quoteRequestRepository.aggregate([
      {
        $match: {
          agencyId: agencyObjectId,
          createdAt: { $gte: rangeStart },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const normalizeQuote = (q) => ({
    id: String(q._id),
    reference: q.reference,
    destination: q.destination,
    travelStart: q.travelStart,
    travelEnd: q.travelEnd,
    adults: q.adults,
    children: q.children ?? 0,
    rooms: q.rooms ?? 1,
    status: q.status,
    budgetCategory: q.budgetCategory,
    contactPerson: q.contactPerson
      ? {
          name: q.contactPerson.name,
          email: q.contactPerson.email,
          phone: q.contactPerson.phone,
          designation: q.contactPerson.designation,
        }
      : undefined,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  });

  const recentActivity = [];
  allQuotesWithTimeline.data.forEach((q) => {
    (q.timeline || []).forEach((t) => {
      recentActivity.push({
        id: `${q._id}-${t.status}-${new Date(t.timestamp).getTime()}`,
        type: `quote_${t.status}`,
        title: t.label,
        description:
          t.description || `${q.reference} · ${q.destination}${t.actor ? ` · ${t.actor}` : ''}`,
        quoteReference: q.reference,
        quoteId: String(q._id),
        timestamp: t.timestamp,
      });
    });
  });

  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const slicedActivity = recentActivity.slice(0, 8);

  const destTotal = totalQuotes || destinationAgg.reduce((sum, d) => sum + d.count, 0) || 1;
  const destinationStats = destinationAgg.map((d) => ({
    name: d._id,
    count: d.count,
    percent: Math.round((d.count / destTotal) * 100),
  }));

  const monthlyMap = new Map(
    monthlyAgg.map((row) => [
      `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
      row.count,
    ])
  );
  const monthlyQuoteVolume = monthBuckets.map((b) => ({
    month: b.month,
    year: b.year,
    value: monthlyMap.get(b.key) || 0,
  }));

  const eligible = Math.max(totalQuotes - draftCount, 0);
  // Conversion = admin-approved pipeline (Approved KPI) + quotations ready for agency.
  // Admin Approve sets under_review; partner `accepted` is a later step still counted in Approved KPI.
  const conversionNumerator = acceptedQuotes + quotesReady;
  const conversionRate =
    eligible > 0 ? Math.round((conversionNumerator / eligible) * 1000) / 10 : 0;

  return {
    kpis: {
      openRequests,
      submittedToday,
      quotesReady,
      acceptedQuotes,
      pendingRevisions,
    },
    recentQuotes: recentQuotesResponse.data.map(normalizeQuote),
    recentActivity: slicedActivity,
    destinationStats,
    monthlyQuoteVolume,
    conversionRate,
    totalQuotes,
    unreadNotificationCount: 0,
    notifications: [],
  };
};

/** Admin: list quotes across agencies (optional filters). */
export const getAdminQuotes = async (
  filter = {},
  sort = { createdAt: -1 },
  page = 1,
  pageSize = 50
) => {
  const { data, total } = await quoteRequestRepository.findSorted(filter, sort, page, pageSize);
  const agencyIds = [...new Set(data.map((q) => String(q.agencyId)))];
  const { Agency } = await import('../models/agency.model.js');
  const agencies = await Agency.find({ _id: { $in: agencyIds } })
    .select('companyName tradeName')
    .lean();
  const agencyMap = new Map(agencies.map((a) => [String(a._id), a]));

  const mapped = data.map((q) => {
    const agency = agencyMap.get(String(q.agencyId));
    return {
      _id: String(q._id),
      reference: q.reference,
      agencyId: String(q.agencyId),
      agencyName: agency?.companyName || 'Agency',
      agencyTradeName: agency?.tradeName || undefined,
      destination: q.destination,
      travelStart: q.travelStart,
      travelEnd: q.travelEnd,
      adults: q.adults,
      children: q.children ?? 0,
      rooms: q.rooms ?? 1,
      budgetCategory: q.budgetCategory,
      status: q.status,
      contactPerson: q.contactPerson,
      adminFeedback: q.adminFeedback || undefined,
      internalNotes: q.internalNotes || undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  });

  return { data: mapped, total };
};

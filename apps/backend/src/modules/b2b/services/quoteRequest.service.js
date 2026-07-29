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

export const saveDraft = async (payload, agencyId, agencyUserId, id = null) => {
  const now = new Date();
  if (id) {
    // Update existing draft — single document write, transaction not strictly necessary
    const existing = await quoteRequestRepository.findById(id);
    if (!existing) {
      throw new AppError('Quote draft not found', 404);
    }
    const existingAgencyId = existing.agencyId._id ? existing.agencyId._id.toString() : existing.agencyId.toString();
    if (existingAgencyId !== agencyId.toString()) {
      throw new AppError('Forbidden: Access denied to this quote', 403);
    }
    if (existing.status !== B2BQuoteStatus.DRAFT) {
      throw new AppError('Cannot update draft status of a submitted quote', 400);
    }

    const update = {
      ...payload,
      updatedBy: agencyUserId,
    };
    return await quoteRequestRepository.findOneAndUpdate({ _id: id }, update, { new: true });
  }

  // Create new draft with reference number generation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentYear = new Date().getFullYear();
    const seq = await counterRepository.getNextSequenceValue(`quotes_${currentYear}`, { session });
    const reference = `QR-${currentYear}-${String(seq).padStart(6, '0')}`;

    const quoteData = {
      ...payload,
      reference,
      agencyId,
      status: B2BQuoteStatus.DRAFT,
      timeline: [
        {
          status: B2BQuoteStatus.DRAFT,
          label: 'Draft Created',
          description: 'Quote request draft saved.',
          timestamp: now,
          actor: payload.contactPerson?.name || 'Agent',
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
  const existingAgencyId = quote.agencyId._id ? quote.agencyId._id.toString() : quote.agencyId.toString();
  if (existingAgencyId !== agencyId.toString()) {
    throw new AppError('Forbidden: Access denied to this quote', 403);
  }
  return quote;
};

export const updateQuoteStatus = async (id, status, actor, internalNotes = null) => {
  const quote = await quoteRequestRepository.findById(id);
  if (!quote) {
    throw new AppError('Quote request not found', 404);
  }

  const update = {
    status,
    $push: {
      timeline: {
        status,
        label: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: `Quote status updated to ${status}.`,
        timestamp: new Date(),
        actor,
      },
    },
  };

  if (internalNotes !== null) {
    update.internalNotes = internalNotes;
  }

  return await quoteRequestRepository.findOneAndUpdate({ _id: id }, update, { new: true });
};

export const getDashboardSummary = async (agencyId) => {
  const filter = { agencyId };
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Parallelize database operations for optimized performance
  const [
    openRequests,
    submittedToday,
    quotesReady,
    acceptedQuotes,
    pendingRevisions,
    recentQuotesResponse,
    allQuotesWithTimeline
  ] = await Promise.all([
    quoteRequestRepository.countDocuments({
      ...filter,
      status: {
        $in: [
          B2BQuoteStatus.SUBMITTED,
          B2BQuoteStatus.UNDER_REVIEW,
          B2BQuoteStatus.VENDOR_SOURCING,
          B2BQuoteStatus.QUOTATION_PREPARATION,
          B2BQuoteStatus.QUOTATION_UPDATED,
        ],
      },
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      createdAt: { $gte: startOfToday },
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: B2BQuoteStatus.QUOTATION_READY,
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: B2BQuoteStatus.ACCEPTED,
    }),
    quoteRequestRepository.countDocuments({
      ...filter,
      status: B2BQuoteStatus.REVISION_REQUESTED,
    }),
    quoteRequestRepository.findSorted(filter, { createdAt: -1 }, 1, 5),
    quoteRequestRepository.findSorted(filter, { updatedAt: -1 }, 1, 10),
  ]);

  // Dynamic timelines mapping to active partner feeds
  const recentActivity = [];
  allQuotesWithTimeline.data.forEach(q => {
    q.timeline.forEach(t => {
      recentActivity.push({
        id: `${q._id}-${t.status}-${new Date(t.timestamp).getTime()}`,
        type: `quote_${t.status}`,
        title: t.label,
        description: t.description || `Quote status transitioned to ${t.status}`,
        quoteReference: q.reference,
        quoteId: q._id,
        timestamp: t.timestamp,
      });
    });
  });

  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const slicedActivity = recentActivity.slice(0, 8);

  return {
    kpis: {
      openRequests,
      submittedToday,
      quotesReady,
      acceptedQuotes,
      pendingRevisions,
    },
    recentQuotes: recentQuotesResponse.data,
    recentActivity: slicedActivity,
  };
};

import CustomProposal from '../models/customProposal.model.js';
import B2BCity from '../models/b2bCity.model.js';
import B2BHotel from '../models/b2bHotel.model.js';
import B2BPackage from '../models/b2bPackage.model.js';
import { sendSuccess } from '#shared/utils/response.js';
import { AppError } from '#shared/errors/AppError.js';

/** Aligns with quote review gate vocabulary. */
export const ProposalStatus = {
  DRAFT: 'draft',
  PRICED: 'priced', // legacy
  SAVED: 'saved', // legacy
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  REVISION_REQUESTED: 'revision_requested',
};

/** Statuses that admin can treat as awaiting review. */
const PENDING_REVIEW = new Set([
  ProposalStatus.SUBMITTED,
  ProposalStatus.PRICED,
  ProposalStatus.SAVED,
]);

const nextReference = async () => {
  const year = new Date().getFullYear();
  const count = await CustomProposal.countDocuments();
  return `CP-${year}-${String(count + 1).padStart(6, '0')}`;
};

/** Readable draft/proposal name from destinations + leave date. */
export const buildProposalName = (destinations, leavingOn) => {
  const parts = (destinations || []).map((d) => d.cityName).filter(Boolean);
  const nights = (destinations || []).reduce((s, d) => s + (Number(d.nights) || 0), 0);
  let dateStr = '';
  if (leavingOn) {
    const d = leavingOn instanceof Date ? leavingOn : new Date(leavingOn);
    if (!Number.isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  if (parts.length === 0) return 'Untitled draft';
  const cities =
    parts.length <= 2 ? parts.join(' → ') : `${parts[0]} → … → ${parts[parts.length - 1]}`;
  const base = nights > 0 ? `${cities} (${nights}n)` : cities;
  return dateStr ? `${base} · ${dateStr}` : base;
};

const packageLineAmount = (pkg, nights, includeTransfers, breakdown) => {
  const currency = pkg.currency || 'USD';
  const base = Number(pkg.amounts?.basePrice) || 0;
  const perNight = Number(pkg.amounts?.perNight) || 0;
  const activity = Number(pkg.amounts?.activityAddon) || 0;
  const line = base + perNight * nights + activity;
  const label = `${pkg.name} (${nights}n)`;
  let transferTotal = 0;
  if (includeTransfers) {
    const t = Number(pkg.amounts?.transferAddon) || 0;
    transferTotal = t;
    if (t > 0) breakdown.push({ label: `Transfer — ${pkg.name}`, amount: t });
  }
  return { line, label, currency, transferTotal };
};

/** Activity day-slot price: prefer activityAddon, else basePrice (package used as activity). */
export const activityAmountFromPackage = (pkg) => {
  const addon = Number(pkg.amounts?.activityAddon) || 0;
  if (addon > 0) return addon;
  return Number(pkg.amounts?.basePrice) || 0;
};

/**
 * Price a custom package from master hotels / packages.
 * No dummy amounts — all figures come from DB masters.
 * Stay pricing only when the agency explicitly picks packageId or hotelId
 * (no silent “cheapest package” default — that confused users).
 * Day activities add package-based amounts only when user adds them.
 */
export const calculatePricing = async (destinations, includeTransfers, activities = []) => {
  const breakdown = [];
  let subtotal = 0;
  let transferTotal = 0;
  let currency = 'USD';

  for (const stop of destinations || []) {
    const nights = Math.max(1, Number(stop.nights) || 1);
    let line = 0;
    let label = stop.cityName || 'City';

    if (stop.packageId) {
      const pkg = await B2BPackage.findById(stop.packageId).lean();
      if (pkg) {
        const priced = packageLineAmount(pkg, nights, includeTransfers, breakdown);
        currency = priced.currency || currency;
        line = priced.line;
        label = priced.label;
        transferTotal += priced.transferTotal;
      }
    } else if (stop.hotelId) {
      const hotel = await B2BHotel.findById(stop.hotelId).lean();
      if (hotel) {
        const rate = Number(hotel.baseNightlyRate) || 0;
        currency = hotel.currency || currency;
        if (rate > 0) {
          line = rate * nights;
          label = `${hotel.name} × ${nights}n`;
        }
        // Hotel with $0 rate: do not auto-attach a package — user must pick one
      }
    }
    // City only / no selection: $0 for stay (suggestion shown in UI)

    subtotal += line;
    if (line > 0) breakdown.push({ label, amount: line });
  }

  for (const act of activities || []) {
    if (!act?.packageId) continue;
    const pkg = await B2BPackage.findById(act.packageId).lean();
    if (!pkg || !pkg.isActive) continue;
    if (act.cityId && String(pkg.cityId) !== String(act.cityId)) continue;

    const amount = activityAmountFromPackage(pkg);
    currency = pkg.currency || currency;
    if (amount > 0) {
      subtotal += amount;
      const slot = act.slot || 'Activity';
      const dayLabel = act.dayNum ? `Day ${act.dayNum} ${slot}` : slot;
      breakdown.push({
        label: `${pkg.name} — ${dayLabel}`,
        amount,
      });
    }
  }

  return {
    currency,
    subtotal,
    transferTotal,
    total: subtotal + transferTotal,
    breakdown,
  };
};

export const listProposals = async (req, res, next) => {
  try {
    const proposals = await CustomProposal.find({ agencyId: req.agency._id })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, 200, 'Proposals fetched', { data: proposals });
  } catch (err) {
    next(err);
  }
};

export const getProposal = async (req, res, next) => {
  try {
    const proposal = await CustomProposal.findOne({
      _id: req.params.id,
      agencyId: req.agency._id,
    }).lean();
    if (!proposal) throw new AppError('Proposal not found', 404);
    return sendSuccess(res, 200, 'Proposal fetched', { data: proposal });
  } catch (err) {
    next(err);
  }
};

export const createOrPriceProposal = async (req, res, next) => {
  try {
    const { destinations, tripDetails, activities, save, name: nameInput } = req.body;
    if (!Array.isArray(destinations) || destinations.length === 0) {
      throw new AppError('At least one destination city is required', 400);
    }

    const agencyId = req.agency._id;
    const normalized = [];
    const cityIdSet = new Set();

    for (const stop of destinations) {
      if (!stop.cityId) throw new AppError('Each stop needs cityId', 400);
      const city = await B2BCity.findOne({
        _id: stop.cityId,
        isActive: true,
      }).lean();
      if (!city) {
        throw new AppError('City not found or inactive', 400);
      }
      cityIdSet.add(String(city._id));
      let hotelName = '';
      if (stop.hotelId) {
        const hotel = await B2BHotel.findById(stop.hotelId).lean();
        if (!hotel || String(hotel.cityId) !== String(city._id)) {
          throw new AppError('Invalid hotel for city', 400);
        }
        hotelName = hotel.name;
      }
      normalized.push({
        cityId: city._id,
        cityName: city.name,
        nights: Math.max(1, Number(stop.nights) || 1),
        hotelId: stop.hotelId || null,
        hotelName,
        packageId: stop.packageId || null,
      });
    }

    const SLOTS = new Set(['Morning', 'Afternoon', 'Evening']);
    const normalizedActivities = [];
    for (const act of Array.isArray(activities) ? activities : []) {
      if (!act?.packageId || !act?.cityId || !act?.dayNum || !act?.slot) continue;
      if (!SLOTS.has(act.slot)) {
        throw new AppError('Invalid activity slot', 400);
      }
      if (!cityIdSet.has(String(act.cityId))) {
        throw new AppError('Activity city must match a destination', 400);
      }
      const pkg = await B2BPackage.findOne({
        _id: act.packageId,
        cityId: act.cityId,
        isActive: true,
      }).lean();
      if (!pkg) {
        throw new AppError('Activity package not found for city', 400);
      }
      normalizedActivities.push({
        dayNum: Math.max(1, Number(act.dayNum) || 1),
        slot: act.slot,
        cityId: pkg.cityId,
        packageId: pkg._id,
        packageName: pkg.name,
        amount: activityAmountFromPackage(pkg),
        currency: pkg.currency || 'USD',
      });
    }

    const includeTransfers = tripDetails?.includeTransfers !== false;
    const pricing = await calculatePricing(normalized, includeTransfers, normalizedActivities);

    let leavingFromName = '';
    if (tripDetails?.leavingFromCityId) {
      const from = await B2BCity.findById(tripDetails.leavingFromCityId).lean();
      leavingFromName = from?.name || '';
    }

    const tripPayload = {
      leavingFromCityId: tripDetails?.leavingFromCityId || null,
      leavingFromName,
      nationalityCode: tripDetails?.nationalityCode || '',
      leavingOn: tripDetails?.leavingOn ? new Date(tripDetails.leavingOn) : null,
      rooms: Number(tripDetails?.rooms) || 1,
      adults: Number(tripDetails?.adults) || 2,
      children: Number(tripDetails?.children) || 0,
      starRating: Number(tripDetails?.starRating) || 0,
      includeTransfers,
    };

    const autoName = buildProposalName(normalized, tripPayload.leavingOn);
    const resolvedName =
      typeof nameInput === 'string' && nameInput.trim() ? nameInput.trim().slice(0, 160) : autoName;

    if (req.params.id) {
      const existing = await CustomProposal.findOne({
        _id: req.params.id,
        agencyId,
      });
      if (!existing) throw new AppError('Proposal not found', 404);

      existing.destinations = normalized;
      existing.activities = normalizedActivities;
      existing.tripDetails = tripPayload;
      existing.pricing = pricing;
      // Keep a stable recognizable name: client override, else refresh from itinerary while draft
      if (typeof nameInput === 'string' && nameInput.trim()) {
        existing.name = nameInput.trim().slice(0, 160);
      } else if (
        !existing.name ||
        existing.status === ProposalStatus.DRAFT ||
        existing.status === ProposalStatus.PRICED
      ) {
        existing.name = autoName;
      }

      if (save) {
        // Submit / resubmit for admin review (quote vocabulary: submitted = Pending)
        existing.status = ProposalStatus.SUBMITTED;
        existing.adminFeedback = '';
      } else if (
        existing.status === ProposalStatus.DRAFT ||
        existing.status === ProposalStatus.PRICED
      ) {
        existing.status = ProposalStatus.DRAFT;
      }
      // Submitted / approved: keep status (do not demote)

      await existing.save();
      return sendSuccess(res, 200, save ? 'Proposal submitted for review' : 'Draft saved', {
        data: existing.toObject(),
      });
    }

    const reference = await nextReference();
    const created = await CustomProposal.create({
      agencyId,
      createdBy: req.user._id,
      name: resolvedName,
      destinations: normalized,
      activities: normalizedActivities,
      tripDetails: tripPayload,
      pricing,
      reference,
      status: save ? ProposalStatus.SUBMITTED : ProposalStatus.DRAFT,
      adminFeedback: '',
    });
    return sendSuccess(res, 201, save ? 'Proposal submitted for review' : 'Draft saved', {
      data: created.toObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Agency: resubmit after Needs Changes (revision_requested → submitted).
 */
export const agencyUpdateProposalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const proposal = await CustomProposal.findOne({
      _id: req.params.id,
      agencyId: req.agency._id,
    });
    if (!proposal) throw new AppError('Proposal not found', 404);

    const from = proposal.status;
    const to = status;

    if (to !== ProposalStatus.SUBMITTED) {
      throw new AppError('Agency may only resubmit proposals for review', 400);
    }
    if (from !== ProposalStatus.REVISION_REQUESTED) {
      throw new AppError(`Invalid agency transition from '${from}' to '${to}'`, 400);
    }

    proposal.status = ProposalStatus.SUBMITTED;
    proposal.adminFeedback = '';
    await proposal.save();

    return sendSuccess(res, 200, 'Proposal resubmitted for review', {
      data: proposal.toObject(),
    });
  } catch (err) {
    next(err);
  }
};

/** Global master dropdowns for Create Custom Package (shared by all agencies) */
export const agencyCities = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = { isActive: true };
    if (q) filter.name = { $regex: String(q).trim(), $options: 'i' };
    const cities = await B2BCity.find(filter).sort({ name: 1 }).lean();
    return sendSuccess(res, 200, 'Cities fetched', { data: cities });
  } catch (err) {
    next(err);
  }
};

export const agencyHotels = async (req, res, next) => {
  try {
    const { cityId } = req.query;
    if (!cityId) throw new AppError('cityId is required', 400);
    const city = await B2BCity.findOne({ _id: cityId, isActive: true }).lean();
    if (!city) throw new AppError('City not found', 404);

    const hotels = await B2BHotel.find({ cityId, isActive: true }).sort({ name: 1 }).lean();
    return sendSuccess(res, 200, 'Hotels fetched', { data: hotels });
  } catch (err) {
    next(err);
  }
};

export const agencyPackages = async (req, res, next) => {
  try {
    const { cityId } = req.query;
    const filter = { isActive: true };
    if (cityId) filter.cityId = cityId;

    const packages = await B2BPackage.find(filter)
      .populate('hotelId', 'name starRating baseNightlyRate')
      .sort({ name: 1 })
      .lean();
    return sendSuccess(res, 200, 'Packages fetched', { data: packages });
  } catch (err) {
    next(err);
  }
};

export const adminListProposals = async (req, res, next) => {
  try {
    const { agencyId, status, page = 1, pageSize = 50 } = req.query;
    const filter = {};
    if (agencyId) filter.agencyId = agencyId;
    if (status) {
      if (status === 'pending') {
        filter.status = { $in: [...PENDING_REVIEW] };
      } else {
        filter.status = status;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 50));
    const skip = (pageNum - 1) * sizeNum;

    const [proposals, total] = await Promise.all([
      CustomProposal.find(filter)
        .populate('agencyId', 'companyName tradeName email status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sizeNum)
        .lean(),
      CustomProposal.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      200,
      'Proposals fetched',
      { data: proposals },
      {
        total,
        page: pageNum,
        pageSize: sizeNum,
        hasMore: pageNum * sizeNum < total,
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Approve (→ under_review) or Needs Changes (→ revision_requested).
 * Mirrors quote adminUpdateQuoteStatus review gate.
 */
export const adminUpdateProposalStatus = async (req, res, next) => {
  try {
    const { status, notes, adminFeedback } = req.body;
    if (!status) throw new AppError('Status is required', 400);

    const proposal = await CustomProposal.findById(req.params.id);
    if (!proposal) throw new AppError('Proposal not found', 404);

    const from = proposal.status;
    const to = status;
    const feedback = (adminFeedback ?? notes ?? '').trim();

    const canApprove = PENDING_REVIEW.has(from) && to === ProposalStatus.UNDER_REVIEW;
    const canRequestChanges =
      (PENDING_REVIEW.has(from) || from === ProposalStatus.UNDER_REVIEW) &&
      to === ProposalStatus.REVISION_REQUESTED;
    const canApproveAfterRevision =
      from === ProposalStatus.REVISION_REQUESTED && to === ProposalStatus.UNDER_REVIEW;

    if (!canApprove && !canRequestChanges && !canApproveAfterRevision) {
      throw new AppError(`Invalid admin transition from '${from}' to '${to}'`, 400);
    }

    if (to === ProposalStatus.REVISION_REQUESTED && !feedback) {
      throw new AppError('A comment is required when requesting changes from the agency', 400);
    }

    proposal.status = to;
    if (to === ProposalStatus.REVISION_REQUESTED) {
      proposal.adminFeedback = feedback;
    } else if (to === ProposalStatus.UNDER_REVIEW) {
      proposal.adminFeedback = '';
    }

    await proposal.save();

    const message =
      to === ProposalStatus.UNDER_REVIEW ? 'Proposal approved' : 'Changes requested on proposal';

    return sendSuccess(res, 200, message, { data: proposal.toObject() });
  } catch (err) {
    next(err);
  }
};

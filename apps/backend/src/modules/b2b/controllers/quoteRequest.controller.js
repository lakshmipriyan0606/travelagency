import * as quoteRequestService from '../services/quoteRequest.service.js';
import { sendSuccess } from '#shared/utils/response.js';
import { AppError } from '#shared/errors/AppError.js';
import { logger } from '#shared/utils/logger.js';
import mongoose from 'mongoose';

export const create = async (req, res, next) => {
  try {
    const agencyId = req.agency._id;
    const agencyUserId = req.user._id;

    logger.info({ agencyId, agencyUserId }, 'Creating B2B Quote Request');
    const quote = await quoteRequestService.createQuote(req.body, agencyId, agencyUserId);
    
    logger.info({ quoteId: quote._id, reference: quote.reference, agencyId }, 'B2B Quote Request Created');
    return sendSuccess(res, 201, 'Quote request submitted successfully', quote);
  } catch (error) {
    logger.error({ err: error, agencyId: req.agency?._id }, 'Failed to create B2B Quote Request');
    next(error);
  }
};

export const saveDraft = async (req, res, next) => {
  try {
    const agencyId = req.agency._id;
    const agencyUserId = req.user._id;
    const { id } = req.params;
    let draftId = id;
    if (draftId === 'new') {
      draftId = null;
    } else if (draftId && !mongoose.Types.ObjectId.isValid(draftId)) {
      throw new AppError('Invalid draft ID format', 400);
    }

    logger.info({ agencyId, agencyUserId, draftId }, 'Saving B2B Quote Draft');
    const quote = await quoteRequestService.saveDraft(req.body, agencyId, agencyUserId, draftId);
    
    logger.info({ quoteId: quote._id, reference: quote.reference, agencyId }, 'B2B Quote Draft Saved');
    return sendSuccess(res, 200, 'Draft saved successfully', quote);
  } catch (error) {
    logger.error({ err: error, agencyId: req.agency?._id }, 'Failed to save B2B Quote Draft');
    next(error);
  }
};

export const getQuotes = async (req, res, next) => {
  try {
    const agencyId = req.agency._id;
    const { page = 1, pageSize = 10, status, search, start, end } = req.query;

    const filter = { agencyId };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.destination = { $regex: String(search).trim(), $options: 'i' };
    }

    if (start || end) {
      filter.travelStart = {};
      if (start) filter.travelStart.$gte = new Date(start);
      if (end) filter.travelStart.$lte = new Date(end);
    }

    const sort = { createdAt: -1 };
    const { data, total } = await quoteRequestService.getQuotes(
      filter,
      sort,
      parseInt(page, 10),
      parseInt(pageSize, 10)
    );

    const hasMore = parseInt(page, 10) * parseInt(pageSize, 10) < total;

    return sendSuccess(res, 200, 'Quotes retrieved successfully', data, {
      total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      hasMore,
    });
  } catch (error) {
    logger.error({ err: error, agencyId: req.agency?._id }, 'Failed to retrieve B2B Quote Requests');
    next(error);
  }
};

export const getQuoteById = async (req, res, next) => {
  try {
    const agencyId = req.agency._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Quote ID format', 400);
    }

    const quote = await quoteRequestService.getQuoteById(id, agencyId);
    return sendSuccess(res, 200, 'Quote retrieved successfully', quote);
  } catch (error) {
    logger.error({ err: error, agencyId: req.agency?._id, quoteId: req.params.id }, 'Failed to retrieve B2B Quote Request by ID');
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const agencyId = req.agency._id;
    const summary = await quoteRequestService.getDashboardSummary(agencyId);
    
    // Add agency details to response so DashboardClient doesn't crash on undefined properties
    summary.agency = {
      agencyName: req.agency.companyName,
      contactName: req.user.name,
      commissionRate: req.agency.commissionRate || 0,
      partnerTier: req.agency.partnerTier || 'standard',
      status: req.agency.status,
    };

    return sendSuccess(res, 200, 'Dashboard summary retrieved successfully', {
      ...summary,
      unreadNotificationCount: summary.unreadNotificationCount ?? 0,
      notifications: summary.notifications ?? [],
    });
  } catch (error) {
    logger.error({ err: error, agencyId: req.agency?._id }, 'Failed to retrieve B2B Dashboard Summary');
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;
    const actor = req.user.name;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Quote ID format', 400);
    }

    const allowedStatuses = [
      quoteRequestService.B2BQuoteStatus.ACCEPTED,
      quoteRequestService.B2BQuoteStatus.REVISION_REQUESTED,
    ];

    if (!allowedStatuses.includes(status)) {
      logger.warn({ quoteId: id, status, actor }, 'Forbidden B2B Quote Request Status Update Transition');
      throw new AppError('Invalid status transition requested', 400);
    }

    logger.info({ quoteId: id, status, actor }, 'Updating B2B Quote Request Status');
    const quote = await quoteRequestService.updateQuoteStatus(id, status, actor, internalNotes);
    
    logger.info({ quoteId: id, status, actor }, 'B2B Quote Request Status Updated');
    return sendSuccess(res, 200, `Quote status updated to ${status} successfully`, quote);
  } catch (error) {
    logger.error({ err: error, quoteId: req.params.id }, 'Failed to update B2B Quote Request status');
    next(error);
  }
};

/** Admin: list all agency quotes (paginated). */
export const getAdminQuotes = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 50, status, agencyId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (agencyId) {
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new AppError('Invalid Agency ID format', 400);
      }
      filter.agencyId = agencyId;
    }

    const { data, total } = await quoteRequestService.getAdminQuotes(
      filter,
      { createdAt: -1 },
      parseInt(page, 10),
      parseInt(pageSize, 10)
    );

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    const hasMore = pageNum * sizeNum < total;

    return sendSuccess(res, 200, 'Admin quotes retrieved successfully', data, {
      total,
      page: pageNum,
      pageSize: sizeNum,
      hasMore,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to retrieve admin B2B quotes');
    next(error);
  }
};

/** Admin: quotes for a single agency. */
export const getAdminQuotesByAgency = async (req, res, next) => {
  try {
    const { id: agencyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      throw new AppError('Invalid Agency ID format', 400);
    }
    const { page = 1, pageSize = 50, status } = req.query;
    const filter = { agencyId };
    if (status) filter.status = status;

    const { data, total } = await quoteRequestService.getAdminQuotes(
      filter,
      { createdAt: -1 },
      parseInt(page, 10),
      parseInt(pageSize, 10)
    );

    return sendSuccess(res, 200, 'Agency quotes retrieved successfully', data, {
      total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      hasMore: parseInt(page, 10) * parseInt(pageSize, 10) < total,
    });
  } catch (error) {
    logger.error({ err: error, agencyId: req.params.id }, 'Failed to retrieve agency quotes for admin');
    next(error);
  }
};

/** Admin: update quote status (ops). */
export const adminUpdateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, internalNotes } = req.body;
    const actor = req.user?.name || 'Admin';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Quote ID format', 400);
    }
    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const quote = await quoteRequestService.updateQuoteStatus(
      id,
      status,
      actor,
      notes || internalNotes
    );
    return sendSuccess(res, 200, `Quote status updated to ${status} successfully`, quote);
  } catch (error) {
    logger.error({ err: error, quoteId: req.params.id }, 'Failed to admin-update quote status');
    next(error);
  }
};

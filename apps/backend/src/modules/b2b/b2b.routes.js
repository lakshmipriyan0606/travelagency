import express from 'express';
import * as b2bAuth from './controllers/b2bAuth.controller.js';
import * as b2bLifecycle from './controllers/b2bLifecycle.controller.js';
import * as quoteRequest from './controllers/quoteRequest.controller.js';
import { requireAgencyAuth, requireAdminRole } from './middleware/b2bAuth.middleware.js';
import { b2bLoginLimiter } from './middleware/b2bRateLimiter.middleware.js';
import { validateBody } from '#shared/middleware/validation.middleware.js';
import { registerSchema, createQuoteSchema, saveDraftSchema } from './b2b.validation.js';

const router = express.Router();

// --- Agency Auth Routes ---
router.post('/agency/register', validateBody(registerSchema), b2bAuth.register);
router.post('/agency/login', b2bLoginLimiter, b2bAuth.login);
router.post('/agency/forgot-password', b2bLoginLimiter, b2bAuth.forgotPasswordAgency);
router.post('/agency/reset-password', b2bLoginLimiter, b2bAuth.resetPasswordAgency);
router.post('/agency/refresh', b2bAuth.refreshAgency);
router.post('/agency/logout', b2bAuth.logoutAgency);
router.get('/agency/me', requireAgencyAuth, b2bAuth.meAgency);
router.patch('/agency/me', requireAgencyAuth, b2bAuth.updateProfileAgency);

// --- Agency Quote Request Routes ---
router.post(
  '/agency/quotes',
  requireAgencyAuth,
  validateBody(createQuoteSchema),
  quoteRequest.create
);
router.patch(
  '/agency/quotes/:id/draft',
  requireAgencyAuth,
  validateBody(saveDraftSchema),
  quoteRequest.saveDraft
);
router.get('/agency/quotes', requireAgencyAuth, quoteRequest.getQuotes);
router.get('/agency/quotes/:id', requireAgencyAuth, quoteRequest.getQuoteById);
router.delete('/agency/quotes/:id', requireAgencyAuth, quoteRequest.deleteQuote);
router.patch('/agency/quotes/:id/status', requireAgencyAuth, quoteRequest.updateStatus);

// --- Agency Dashboard Routes ---
router.get('/agency/dashboard/summary', requireAgencyAuth, quoteRequest.getDashboardSummary);

// --- Admin Auth Routes ---
router.post('/admin/login', b2bLoginLimiter, b2bAuth.loginAdmin);
router.post('/admin/forgot-password', b2bLoginLimiter, b2bAuth.forgotPasswordAdmin);
router.post('/admin/reset-password', b2bLoginLimiter, b2bAuth.resetPasswordAdmin);
router.post('/admin/refresh', b2bAuth.refreshAdmin);
router.post('/admin/logout', b2bAuth.logoutAdmin);
router.get('/admin/me', requireAdminRole(), b2bAuth.meAdmin);

// --- Admin Agency Lifecycle Routes ---
router.get('/admin/agencies', requireAdminRole('superadmin', 'ops'), b2bLifecycle.getAgencies);
router.patch(
  '/admin/agencies/:id/approve',
  requireAdminRole('superadmin', 'ops'),
  b2bLifecycle.approveAgency
);
router.patch(
  '/admin/agencies/:id/reject',
  requireAdminRole('superadmin', 'ops'),
  b2bLifecycle.rejectAgency
);
router.patch(
  '/admin/agencies/:id/suspend',
  requireAdminRole('superadmin'),
  b2bLifecycle.suspendAgency
);
router.patch(
  '/admin/agencies/:id/reactivate',
  requireAdminRole('superadmin'),
  b2bLifecycle.reactivateAgency
);
router.get(
  '/admin/agencies/:id/status-log',
  requireAdminRole('superadmin', 'ops'),
  b2bLifecycle.getStatusLog
);

// --- Admin Quote Routes ---
router.get('/admin/quotes', requireAdminRole('superadmin', 'ops'), quoteRequest.getAdminQuotes);
router.get(
  '/admin/agencies/:id/quotes',
  requireAdminRole('superadmin', 'ops'),
  quoteRequest.getAdminQuotesByAgency
);
router.patch(
  '/admin/quotes/:id/status',
  requireAdminRole('superadmin', 'ops'),
  quoteRequest.adminUpdateQuoteStatus
);

export default router;

import express from 'express';
import * as b2bAuth from './controllers/b2bAuth.controller.js';
import * as b2bLifecycle from './controllers/b2bLifecycle.controller.js';
import * as quoteRequest from './controllers/quoteRequest.controller.js';
import * as masterData from './controllers/b2bMasterData.controller.js';
import * as customProposal from './controllers/customProposal.controller.js';
import { requireAgencyAuth, requireAdminRole } from './middleware/b2bAuth.middleware.js';
import { b2bLoginLimiter } from './middleware/b2bRateLimiter.middleware.js';
import { validateBody } from '#shared/middleware/validation.middleware.js';
import { registerSchema, createQuoteSchema, saveDraftSchema } from './b2b.validation.js';

const router = express.Router();
const adminOps = requireAdminRole('superadmin', 'ops');

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

// --- Agency Create Custom Package (master dropdowns + proposals) ---
router.get('/agency/master/cities', requireAgencyAuth, customProposal.agencyCities);
router.get('/agency/master/hotels', requireAgencyAuth, customProposal.agencyHotels);
router.get('/agency/master/packages', requireAgencyAuth, customProposal.agencyPackages);
router.get('/agency/proposals', requireAgencyAuth, customProposal.listProposals);
router.get('/agency/proposals/:id', requireAgencyAuth, customProposal.getProposal);
router.post('/agency/proposals', requireAgencyAuth, customProposal.createOrPriceProposal);
router.put('/agency/proposals/:id', requireAgencyAuth, customProposal.createOrPriceProposal);
router.patch(
  '/agency/proposals/:id/status',
  requireAgencyAuth,
  customProposal.agencyUpdateProposalStatus
);

// --- Admin Auth Routes ---
router.post('/admin/login', b2bLoginLimiter, b2bAuth.loginAdmin);
router.post('/admin/forgot-password', b2bLoginLimiter, b2bAuth.forgotPasswordAdmin);
router.post('/admin/reset-password', b2bLoginLimiter, b2bAuth.resetPasswordAdmin);
router.post('/admin/refresh', b2bAuth.refreshAdmin);
router.post('/admin/logout', b2bAuth.logoutAdmin);
router.get('/admin/me', requireAdminRole(), b2bAuth.meAdmin);

// --- Admin Agency Lifecycle Routes ---
router.get('/admin/agencies', adminOps, b2bLifecycle.getAgencies);
router.patch('/admin/agencies/:id/approve', adminOps, b2bLifecycle.approveAgency);
router.patch('/admin/agencies/:id/reject', adminOps, b2bLifecycle.rejectAgency);
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
router.get('/admin/agencies/:id/status-log', adminOps, b2bLifecycle.getStatusLog);

// --- Admin Quote Routes ---
router.get('/admin/quotes', adminOps, quoteRequest.getAdminQuotes);
router.get('/admin/agencies/:id/quotes', adminOps, quoteRequest.getAdminQuotesByAgency);
router.patch('/admin/quotes/:id/status', adminOps, quoteRequest.adminUpdateQuoteStatus);

// --- Admin Master Data: Cities ---
router.get('/admin/cities', adminOps, masterData.listCities);
router.post('/admin/cities', adminOps, masterData.createCity);
router.patch('/admin/cities/:id', adminOps, masterData.updateCity);
router.delete('/admin/cities/:id', adminOps, masterData.deleteCity);

// --- Admin Master Data: Hotels ---
router.get('/admin/hotels', adminOps, masterData.listHotels);
router.post('/admin/hotels', adminOps, masterData.createHotel);
router.patch('/admin/hotels/:id', adminOps, masterData.updateHotel);
router.delete('/admin/hotels/:id', adminOps, masterData.deleteHotel);

// --- Admin Master Data: Packages ---
router.get('/admin/packages', adminOps, masterData.listPackages);
router.post('/admin/packages', adminOps, masterData.createPackage);
router.patch('/admin/packages/:id', adminOps, masterData.updatePackage);
router.delete('/admin/packages/:id', adminOps, masterData.deletePackage);

// --- Admin Custom Proposals (review gate) ---
router.get('/admin/proposals', adminOps, customProposal.adminListProposals);
router.patch('/admin/proposals/:id/status', adminOps, customProposal.adminUpdateProposalStatus);

export default router;

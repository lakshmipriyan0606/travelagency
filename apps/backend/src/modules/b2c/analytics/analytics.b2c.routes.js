import express from 'express';
import { recordVisit } from './analytics.controller.js';

const router = express.Router();

/** Public visit beacon — no auth. Local/dev traffic is skipped in the service. */
router.post('/visit', recordVisit);

export default router;

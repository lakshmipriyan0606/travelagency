import express from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import monitorRoutes from './routes/monitor.routes.js';
import capacityRoutes from './routes/capacity.routes.js';
import observabilityRoutes from './routes/observability.routes.js';
import { devopsNoCache } from './middleware/devopsAuth.middleware.js';

const devopsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many DevOps requests' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many DevOps auth attempts' },
});

const router = express.Router();
router.use(devopsNoCache);
router.use(devopsLimiter);
router.use('/auth', authLimiter, authRoutes);
router.use(monitorRoutes);
router.use(capacityRoutes);
router.use(observabilityRoutes);

export default router;

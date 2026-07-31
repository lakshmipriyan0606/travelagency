import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getSession,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/refresh', refresh);
router.post('/logout', logout);
router.get('/session', getSession);

export default router;

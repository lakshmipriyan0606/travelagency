/**
 * ============================================================================
 * Newsletter Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Orchestrates HTTP payloads for newsletter subscriptions.
 *
 * Called By:
 * src/modules/newsletter/newsletter.b2c.routes.js
 *
 * Depends On:
 * src/modules/newsletter/newsletter.service.js
 * ============================================================================
 */
import * as newsletterService from './newsletter.service.js';
import { sendSuccess } from '#utils/response.js';

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    const newSubscriber = await newsletterService.subscribeNewsletterService(email);
    return sendSuccess(res, 201, 'Subscribed successfully', { data: newSubscriber });
  } catch (error) {
    next(error);
  }
};

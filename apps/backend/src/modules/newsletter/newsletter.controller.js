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

/**
 * Handle new newsletter subscription.
 *
 * Request Flow:
 * Client
 *   ↓
 * Route (POST /api/v1/b2c/newsletter/subscribe)
 *   ↓
 * Controller (subscribeNewsletter)
 *   ↓
 * Service (subscribeNewsletterService) -> Sends Welcome Email
 *   ↓
 * Database (Newsletter Collection)
 *   ↓
 * Response (201 Created)
 */
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const newSubscriber = await newsletterService.subscribeNewsletterService(email);
    return res.status(201).json({
      message: 'Subscribed successfully',
      data: newSubscriber,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Server error' });
  }
};

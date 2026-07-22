/**
 * ============================================================================
 * Destination Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests to manage the "Popular Destinations" featured
 * on the public storefront.
 *
 * Called By:
 * src/modules/destinations/destination.b2c.routes.js
 * src/modules/destinations/destination.admin.routes.js
 *
 * Depends On:
 * src/modules/destinations/destination.service.js
 * ============================================================================
 */
import * as destinationService from './destination.service.js';

/**
 * Creates a new popular destination if under the max limit.
 *
 * Request Flow:
 * Admin Client
 *   ↓
 * Route (POST /api/v1/b2c-admin/destinations)
 *   ↓
 * Controller (createDestination)
 *   ↓
 * Service (createDestination) -> Validation -> Enforcement
 *   ↓
 * Response (201 Created)
 */
export const createDestination = async (req, res) => {
  try {
    const destination = await destinationService.createDestination(req.body);
    return res.status(201).json(destination);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Failed to create destination' });
  }
};

/**
 * Fetch all popular destinations in order.
 */
export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await destinationService.getAllDestinations();
    return res.status(200).json(destinations);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch destinations' });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await destinationService.updateDestination(id, req.body);
    return res.status(200).json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Failed to update destination' });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    await destinationService.deleteDestination(id);
    return res.status(200).json({ message: 'Destination deleted successfully' });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Failed to delete destination' });
  }
};

export const moveDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const result = await destinationService.moveDestination(id, direction);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Failed to move destination' });
  }
};

export const normalizeDestinationsOrder = async (req, res) => {
  try {
    const result = await destinationService.normalizeDestinationsOrder();
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Failed to normalize destination orders' });
  }
};

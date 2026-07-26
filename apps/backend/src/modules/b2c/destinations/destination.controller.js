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
import { sendSuccess } from '#shared/utils/response.js';

export const createDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.createDestination(req.body);
    return sendSuccess(res, 201, 'Destination created successfully', destination);
  } catch (error) {
    next(error);
  }
};

export const getAllDestinations = async (req, res, next) => {
  try {
    const destinations = await destinationService.getAllDestinations();
    return sendSuccess(res, 200, 'Destinations fetched successfully', destinations);
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await destinationService.updateDestination(id, req.body);
    return sendSuccess(res, 200, 'Destination updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    await destinationService.deleteDestination(id);
    return sendSuccess(res, 200, 'Destination deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const moveDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const result = await destinationService.moveDestination(id, direction);
    return sendSuccess(res, 200, 'Destination moved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const normalizeDestinationsOrder = async (req, res, next) => {
  try {
    const result = await destinationService.normalizeDestinationsOrder();
    return sendSuccess(res, 200, 'Destination orders normalized successfully', result);
  } catch (error) {
    next(error);
  }
};

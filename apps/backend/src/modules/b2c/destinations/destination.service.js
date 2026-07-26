/**
 * ============================================================================
 * Destination Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Enforces the business rule that there can only be a maximum of 4
 * popular destinations. Handles the complex logic of re-ordering (swapping)
 * destinations in the UI grid.
 *
 * Called By:
 * src/modules/destinations/destination.controller.js
 *
 * Depends On:
 * src/modules/destinations/destination.repository.js
 * ============================================================================
 */
import * as destinationRepository from './destination.repository.js';
import { validateDestinationInput } from './destination.validation.js';
import { MAX_POPULAR_DESTINATIONS } from './destination.constants.js';

/**
 * Creates a new destination, strictly enforcing the maximum allowed limit.
 */
export const createDestination = async (data) => {
  const { isValid, errors } = validateDestinationInput(data);
  if (!isValid) {
    throw new Error(errors.join(' '));
  }

  const currentCount = await destinationRepository.count();
  if (currentCount >= MAX_POPULAR_DESTINATIONS) {
    const error = new Error(`Maximum of ${MAX_POPULAR_DESTINATIONS} popular destinations allowed.`);
    error.statusCode = 400;
    throw error;
  }

  return await destinationRepository.create(data);
};

export const getAllDestinations = async () => {
  return await destinationRepository.findAllSorted();
};

export const updateDestination = async (id, updateData) => {
  const updated = await destinationRepository.updateById(id, updateData);
  if (!updated) {
    const error = new Error('Destination not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

export const deleteDestination = async (id) => {
  const deleted = await destinationRepository.deleteById(id);
  if (!deleted) {
    const error = new Error('Destination not found');
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};

/**
 * Swaps the display order of two destinations (e.g. moving one "up" or "down" the grid).
 *
 * Business Intent:
 * Provides the Admin with fine-grained control over the visual placement of
 * destinations on the storefront without hardcoding CSS or deleting/recreating records.
 */
export const moveDestination = async (id, direction) => {
  const currentDest = await destinationRepository.findById(id);
  if (!currentDest) {
    const error = new Error('Destination not found');
    error.statusCode = 404;
    throw error;
  }

  let targetDest;
  if (direction === 'up') {
    targetDest = await destinationRepository.findOne(
      { orderNumber: { $lt: currentDest.orderNumber } },
      { orderNumber: -1 }
    );
  } else {
    targetDest = await destinationRepository.findOne(
      { orderNumber: { $gt: currentDest.orderNumber } },
      { orderNumber: 1 }
    );
  }

  if (!targetDest) {
    const error = new Error(`Cannot move destination further ${direction}`);
    error.statusCode = 400;
    throw error;
  }

  // Atomic swap of ordering values
  const tempOrder = currentDest.orderNumber;
  currentDest.orderNumber = targetDest.orderNumber;
  targetDest.orderNumber = tempOrder;

  await destinationRepository.saveDocument(currentDest);
  await destinationRepository.saveDocument(targetDest);

  return { message: `Destination moved ${direction} successfully` };
};

/**
 * Re-indexes destination order sequentially (1, 2, 3, 4) to fix gaps
 * caused by deletions.
 */
export const normalizeDestinationsOrder = async () => {
  const destinations = await destinationRepository.findAllSorted();
  const updatePromises = destinations.map((dest, index) => {
    dest.orderNumber = index + 1;
    return destinationRepository.saveDocument(dest);
  });
  await Promise.all(updatePromises);
  return { message: 'Destination orders normalized successfully' };
};

import * as destinationRepository from "./destination.repository.js";
import { validateDestinationInput } from "./destination.validation.js";
import { MAX_POPULAR_DESTINATIONS } from "./destination.constants.js";

export const createDestination = async (data) => {
  const { isValid, errors } = validateDestinationInput(data);
  if (!isValid) {
    throw new Error(errors.join(" "));
  }

  const currentCount = await destinationRepository.count();
  if (currentCount >= MAX_POPULAR_DESTINATIONS) {
    const error = new Error("Maximum of 4 popular destinations allowed.");
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
    const error = new Error("Destination not found");
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

export const deleteDestination = async (id) => {
  const deleted = await destinationRepository.deleteById(id);
  if (!deleted) {
    const error = new Error("Destination not found");
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};

export const moveDestination = async (id, direction) => {
  const currentDest = await destinationRepository.findById(id);
  if (!currentDest) {
    const error = new Error("Destination not found");
    error.statusCode = 404;
    throw error;
  }

  let targetDest;
  if (direction === "up") {
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

  const tempOrder = currentDest.orderNumber;
  currentDest.orderNumber = targetDest.orderNumber;
  targetDest.orderNumber = tempOrder;

  await destinationRepository.saveDocument(currentDest);
  await destinationRepository.saveDocument(targetDest);

  return { message: `Destination moved ${direction} successfully` };
};

export const normalizeDestinationsOrder = async () => {
  const destinations = await destinationRepository.findAllSorted();
  const updatePromises = destinations.map((dest, index) => {
    dest.orderNumber = index + 1;
    return destinationRepository.saveDocument(dest);
  });
  await Promise.all(updatePromises);
  return { message: "Destination orders normalized successfully" };
};

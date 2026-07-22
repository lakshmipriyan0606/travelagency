import * as storyRepository from "./story.repository.js";

export const createStoryService = async (body) => {
  const { url, alt, row, orderNumber } = body;
  return await storyRepository.create({ url, alt, row, orderNumber });
};

export const getAllStoriesService = async () => {
  return await storyRepository.findSorted({}, "row orderNumber");
};

export const deleteStoryService = async (id) => {
  const deletedStory = await storyRepository.deleteById(id);
  if (!deletedStory) {
    const error = new Error("Story not found");
    error.statusCode = 404;
    throw error;
  }
  return deletedStory;
};

export const moveStoryService = async (id, direction) => {
  const currentStory = await storyRepository.findById(id);
  if (!currentStory) {
    const error = new Error("Story not found");
    error.statusCode = 404;
    throw error;
  }

  let targetStory;
  if (direction === "up") {
    targetStory = await storyRepository.findOne(
      { row: currentStory.row, orderNumber: { $lt: currentStory.orderNumber } },
      { orderNumber: -1 }
    );
  } else {
    targetStory = await storyRepository.findOne(
      { row: currentStory.row, orderNumber: { $gt: currentStory.orderNumber } },
      { orderNumber: 1 }
    );
  }

  if (!targetStory) {
    const error = new Error(`Cannot move story further ${direction}`);
    error.statusCode = 400;
    throw error;
  }

  const tempOrder = currentStory.orderNumber;
  currentStory.orderNumber = targetStory.orderNumber;
  targetStory.orderNumber = tempOrder;

  await storyRepository.saveDocument(currentStory);
  await storyRepository.saveDocument(targetStory);

  return { message: `Story moved ${direction} successfully` };
};

export const normalizeStoriesOrderService = async () => {
  for (let r of [1, 2]) {
    const stories = await storyRepository.findSorted({ row: r }, "orderNumber");
    const updatePromises = stories.map((story, index) => {
      story.orderNumber = index + 1;
      return storyRepository.saveDocument(story);
    });
    await Promise.all(updatePromises);
  }
  return { message: "Story orders normalized successfully" };
};

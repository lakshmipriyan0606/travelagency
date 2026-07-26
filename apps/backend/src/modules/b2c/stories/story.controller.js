/**
 * ============================================================================
 * Story Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests to manage and fetch customer visual stories.
 *
 * Called By:
 * src/modules/stories/story.b2c.routes.js
 * src/modules/stories/story.admin.routes.js
 *
 * Depends On:
 * src/modules/stories/story.service.js
 * ============================================================================
 */
import * as storyService from './story.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const createStory = async (req, res, next) => {
  try {
    const savedStory = await storyService.createStoryService(req.body);
    return sendSuccess(res, 201, 'Story created successfully', savedStory);
  } catch (error) {
    next(error);
  }
};

export const getAllStories = async (req, res, next) => {
  try {
    const stories = await storyService.getAllStoriesService();
    return sendSuccess(res, 200, 'Stories fetched successfully', stories);
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    await storyService.deleteStoryService(req.params.id);
    return sendSuccess(res, 200, 'Story deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const moveStory = async (req, res, next) => {
  try {
    const { direction } = req.body;
    const result = await storyService.moveStoryService(req.params.id, direction);
    return sendSuccess(res, 200, 'Story moved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const normalizeStoriesOrder = async (req, res, next) => {
  try {
    const result = await storyService.normalizeStoriesOrderService();
    return sendSuccess(res, 200, 'Stories order normalized successfully', result);
  } catch (error) {
    next(error);
  }
};

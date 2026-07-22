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

/**
 * Creates a new Story.
 *
 * Request Flow:
 * Admin Client
 *   ↓
 * Route (POST /api/v1/b2c-admin/stories)
 *   ↓
 * Controller (createStory)
 *   ↓
 * Service (createStoryService) -> Pre-save auto numbering
 *   ↓
 * Database (Story Collection)
 *   ↓
 * Response (201 Created)
 */
export const createStory = async (req, res) => {
  try {
    const savedStory = await storyService.createStoryService(req.body);
    return res.status(201).json(savedStory);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create story' });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const stories = await storyService.getAllStoriesService();
    return res.status(200).json(stories);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch stories' });
  }
};

export const deleteStory = async (req, res) => {
  try {
    await storyService.deleteStoryService(req.params.id);
    return res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Failed to delete story' });
  }
};

export const moveStory = async (req, res) => {
  try {
    const { direction } = req.body;
    const result = await storyService.moveStoryService(req.params.id, direction);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Failed to move story' });
  }
};

export const normalizeStoriesOrder = async (req, res) => {
  try {
    const result = await storyService.normalizeStoriesOrderService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to normalize stories' });
  }
};

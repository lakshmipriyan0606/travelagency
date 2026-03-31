import Story from "../models/Story.model.js";

export const createStory = async (req, res) => {
  try {
    const { url, alt, row, orderNumber } = req.body;
    const story = new Story({ url, alt, row, orderNumber });
    const savedStory = await story.save();
    return res.status(201).json(savedStory);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create story" });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort("row orderNumber");
    return res.status(200).json(stories);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch stories" });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStory = await Story.findByIdAndDelete(id);
    if (!deletedStory) return res.status(404).json({ message: "Story not found" });
    return res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete story" });
  }
};

export const moveStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    const currentStory = await Story.findById(id);
    if (!currentStory) return res.status(404).json({ message: "Story not found" });

    let targetStory;
    if (direction === "up") {
      targetStory = await Story.findOne({ 
        row: currentStory.row, 
        orderNumber: { $lt: currentStory.orderNumber } 
      }).sort({ orderNumber: -1 });
    } else {
      targetStory = await Story.findOne({ 
        row: currentStory.row, 
        orderNumber: { $gt: currentStory.orderNumber } 
      }).sort({ orderNumber: 1 });
    }

    if (!targetStory) {
      return res.status(400).json({ message: `Cannot move story further ${direction}` });
    }

    const tempOrder = currentStory.orderNumber;
    currentStory.orderNumber = targetStory.orderNumber;
    targetStory.orderNumber = tempOrder;

    await currentStory.save();
    await targetStory.save();

    return res.status(200).json({ message: `Story moved ${direction} successfully` });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to move story" });
  }
};

export const normalizeStoriesOrder = async (req, res) => {
  try {
    // Normalize both rows separately
    for (let r of [1, 2]) {
      const stories = await Story.find({ row: r }).sort("orderNumber");
      const updatePromises = stories.map((story, index) => {
        story.orderNumber = index + 1;
        return story.save();
      });
      await Promise.all(updatePromises);
    }
    return res.status(200).json({ message: "Story orders normalized successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to normalize stories" });
  }
};

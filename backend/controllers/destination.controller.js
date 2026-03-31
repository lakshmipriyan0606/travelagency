import { Destination } from "../models/Destination.model.js";

export const createDestination = async (req, res) => {
  try {
    const { title, location, url, alt, orderNumber } = req.body;

    const count = await Destination.countDocuments();
    if (count >= 4) {
      return res.status(400).json({ message: "Maximum of 4 popular destinations allowed." });
    }

    const destination = new Destination({ title, location, url, alt, orderNumber });
    const savedDestination = await destination.save();
    return res.status(201).json(savedDestination);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create destination" });
  }
};

export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort("orderNumber");
    return res.status(200).json(destinations);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch destinations" });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDestination = await Destination.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    return res.status(200).json(updatedDestination);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update destination" });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDestination = await Destination.findByIdAndDelete(id);

    if (!deletedDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    return res.status(200).json({ message: "Destination deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete destination" });
  }
};

export const moveDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    const currentDest = await Destination.findById(id);
    if (!currentDest) return res.status(404).json({ message: "Destination not found" });

    let targetDest;
    if (direction === "up") {
      targetDest = await Destination.findOne({ orderNumber: { $lt: currentDest.orderNumber } }).sort({ orderNumber: -1 });
    } else {
      targetDest = await Destination.findOne({ orderNumber: { $gt: currentDest.orderNumber } }).sort({ orderNumber: 1 });
    }

    if (!targetDest) {
      return res.status(400).json({ message: `Cannot move destination further ${direction}` });
    }

    const tempOrder = currentDest.orderNumber;
    currentDest.orderNumber = targetDest.orderNumber;
    targetDest.orderNumber = tempOrder;

    await currentDest.save();
    await targetDest.save();

    return res.status(200).json({ message: `Destination moved ${direction} successfully` });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to move destination" });
  }
};

export const normalizeDestinationsOrder = async (req, res) => {
  try {
    const destinations = await Destination.find().sort("orderNumber");
    
    const updatePromises = destinations.map((dest, index) => {
      dest.orderNumber = index + 1;
      return dest.save();
    });

    await Promise.all(updatePromises);

    return res.status(200).json({ message: "Destination orders normalized successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to normalize destination orders" });
  }
};

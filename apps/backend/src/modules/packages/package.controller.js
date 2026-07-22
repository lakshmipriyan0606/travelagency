import * as packageService from "./package.service.js";

export const createPackage = async (req, res) => {
  try {
    const pkg = await packageService.createPackageService(req.body, req.files, req.user?._id);
    res.status(201).json({ message: "Package created successfully", data: pkg });
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const pkg = await packageService.updatePackageService(req.params.id, req.body, req.files);
    res.status(200).json({ message: "Package updated successfully", data: pkg });
  } catch (error) {
    console.error("Update package error:", error);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message, message: error.message });
  }
};

export const getBestPackages = async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const data = await packageService.getBestPackages(userId);
    res.status(200).json({ data, message: "All best packages fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching best packages", error: error.message });
  }
};

export const getBestActivities = async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const data = await packageService.getBestActivities(userId);
    res.status(200).json({ data, message: "All best activities fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching best activities", error: error.message });
  }
};

export const getAllPackages = async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const result = await packageService.listPackages(req.query, userId);
    res.status(200).json({ ...result, message: "Packages fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages", error: error.message });
  }
};

export const getActivityCategories = async (req, res) => {
  try {
    const data = await packageService.getActivityCategories();
    res.status(200).json({ data, message: "Activity categories fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity categories", error: error.message });
  }
};

export const getLikedPackages = async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const result = await packageService.getLikedPackages(userId, req.query);
    res.status(200).json({ ...result, message: result.message || "Liked packages fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching liked packages", error: error.message });
  }
};

export const getLikeCount = async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const count = await packageService.getLikeCount(userId);
    res.status(200).json({ data: count, message: "like count fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching like count packages", error: error.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const result = await packageService.getSuggestions(req.query.q);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggestions", error: error.message });
  }
};

export const getTakenRanks = async (req, res) => {
  try {
    const takenRanks = await packageService.getTakenRanks();
    res.json({ takenRanks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const data = await packageService.getPackageById(req.params.id);
    res.status(200).json({ data, message: "Package fetched successfully" });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Error fetching package detail", error: error.message });
  }
};

export const updateRank = async (req, res) => {
  try {
    const result = await packageService.updateRank(req.params.id, req.body.bestRank);
    res.json(result);
  } catch (error) {
    console.error("Quick rank update error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const result = await packageService.toggleStatus(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const deletedPackage = await packageService.deletePackage(req.params.id);
    res.json({ message: "Package deleted successfully", deletedPackage });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { userId, id, liked } = req.body;
    const updatedLikes = await packageService.toggleLike(userId, id, liked);
    res.json({ message: "Updated", likes: updatedLikes });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Server Error", error: error.message });
  }
};

export const syncFromSheet = async (req, res) => {
  try {
    const result = await packageService.syncFromSheetService();
    res.status(200).json({ success: true, message: `Synced ${result.count} packages from sheet` });
  } catch (error) {
    console.error("Sync error:", error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || "Error syncing from sheet", error: error.message });
  }
};

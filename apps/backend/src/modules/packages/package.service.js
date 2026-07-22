import mongoose from 'mongoose';
import * as packageRepository from './package.repository.js';
import { sanitizeImagesArray, sanitizeImageObjects } from './package.mapper.js';
import { PREDEFINED_ACTIVITY_CATEGORIES } from './package.constants.js';
import cloudinary from '../../config/cloudinary.js';
import { fetchPackagesFromSheet } from '../../integrations/googleSheets/googleSheets.service.js';

const uploadFile = (file, folder = 'travel_packages') =>
  new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.secure_url ? result.secure_url : null);
      });
      stream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });

export const createPackageService = async (body, files, userId) => {
  const {
    type,
    packageType,
    location,
    daysAndNights,
    hotelName,
    price,
    offerPrice,
    isBestPackage,
    bestRank,
    packageName,
    packageDescription,
    country,
    isActive,
    status,
    activityCategory,
    operatingHours,
    languages,
    isInstantConfirmation,
    isNonRefundable,
    highlights,
    seo,
  } = body;

  const isActivity =
    (type && String(type).toLowerCase() === 'activity') ||
    (activityCategory && activityCategory !== '' && activityCategory !== 'none');

  let mainImages = [];
  if (body.existingImages) {
    mainImages = JSON.parse(body.existingImages);
  }

  const newMainFiles = (files || []).filter((f) => f.fieldname === 'images');
  const mainImageAlts = body.mainImageAlts ? JSON.parse(body.mainImageAlts) : [];

  for (let i = 0; i < newMainFiles.length; i++) {
    const url = await uploadFile(newMainFiles[i], 'travel_packages/main');
    if (url) mainImages.push({ url, alt: mainImageAlts[i] || '' });
  }

  const sanitizedMainImages = sanitizeImagesArray(mainImages);

  const daysRaw = JSON.parse(body.days || '[]');
  const transformedDays = [];
  for (let d = 0; d < daysRaw.length; d++) {
    const day = daysRaw[d] || {};
    const slots = Array.isArray(day.slots) ? day.slots : [];
    const newSlots = [];

    for (let s = 0; s < slots.length; s++) {
      const slot = slots[s] || {};
      const slotFile = (files || []).find((f) => f.fieldname === `slotImage_${d}_${s}`);
      let slotImageUrl = slot.imageUrl || '';

      if (slotFile) {
        const url = await uploadFile(slotFile, 'travel_packages/slots');
        if (url) slotImageUrl = url;
      }
      newSlots.push({ ...slot, imageUrl: slotImageUrl || '' });
    }
    transformedDays.push({ ...day, slots: newSlots });
  }

  const packageData = {
    type: isActivity ? 'activity' : 'package',
    packageName,
    packageDescription,
    packageType: isActivity ? '' : packageType,
    location,
    daysAndNights,
    hotelName: isActivity ? '' : hotelName,
    price: Number(price) || 0,
    offerPrice: isActivity ? 0 : Number(offerPrice) || 0,
    isBestPackage: isBestPackage === 'true' || isBestPackage === true,
    bestRank: bestRank ? Number(bestRank) : null,
    images: sanitizedMainImages,
    days: transformedDays,
    country,
    isActive: isActive !== 'false',
    status: status || 'Active',
    activityCategory: isActivity ? activityCategory : null,
    seo: seo ? JSON.parse(seo) : {},
    operatingHours: operatingHours || '',
    languages: languages || '',
    isInstantConfirmation: isInstantConfirmation === 'true' || isInstantConfirmation === true,
    isNonRefundable: isNonRefundable === 'true' || isNonRefundable === true,
    highlights: highlights ? JSON.parse(highlights) : [],
    createdBy: userId,
  };

  if (packageData.isBestPackage && packageData.bestRank) {
    const existing = await packageRepository.findOne({ bestRank: packageData.bestRank });
    if (existing) {
      existing.isBestPackage = false;
      existing.bestRank = null;
      await existing.save();
    }
  }

  return await packageRepository.create(packageData);
};

export const updatePackageService = async (id, body, files) => {
  const pkg = await packageRepository.findById(id);
  if (!pkg) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  const {
    type,
    packageType,
    location,
    daysAndNights,
    hotelName,
    price,
    offerPrice,
    isBestPackage,
    bestRank,
    packageName,
    packageDescription,
    country,
    isActive,
    status,
    activityCategory,
    operatingHours,
    languages,
    isInstantConfirmation,
    isNonRefundable,
    highlights,
    seo,
  } = body;

  const isActivity =
    (type && String(type).toLowerCase() === 'activity') ||
    (activityCategory && activityCategory !== '' && activityCategory !== 'none');

  let mainImages = [];
  if (body.existingImages) {
    mainImages = JSON.parse(body.existingImages);
  }
  const newMainFiles = (files || []).filter((f) => f.fieldname === 'images');
  const mainImageAlts = body.mainImageAlts ? JSON.parse(body.mainImageAlts) : [];

  for (let i = 0; i < newMainFiles.length; i++) {
    const url = await uploadFile(newMainFiles[i], 'travel_packages/main');
    if (url) mainImages.push({ url, alt: mainImageAlts[i] || '' });
  }

  pkg.images = sanitizeImagesArray(mainImages);

  const daysRaw = JSON.parse(body.days || '[]');
  const transformedDays = [];
  for (let d = 0; d < daysRaw.length; d++) {
    const day = daysRaw[d] || {};
    const slots = Array.isArray(day.slots) ? day.slots : [];
    const newSlots = [];

    for (let s = 0; s < slots.length; s++) {
      const slot = slots[s] || {};
      const slotFile = (files || []).find((f) => f.fieldname === `slotImage_${d}_${s}`);
      let slotImageUrl = slot.imageUrl || '';

      if (slotFile) {
        const url = await uploadFile(slotFile, 'travel_packages/slots');
        if (url) slotImageUrl = url;
      }
      newSlots.push({ ...slot, imageUrl: slotImageUrl || '' });
    }
    transformedDays.push({ ...day, slots: newSlots });
  }

  pkg.type = isActivity ? 'activity' : 'package';
  pkg.packageName = packageName;
  pkg.packageDescription = packageDescription;
  pkg.location = location;
  pkg.country = country;
  pkg.daysAndNights = daysAndNights;
  pkg.price = Number(price) || 0;
  pkg.isActive = isActive !== 'false';
  pkg.status = status || pkg.status;
  pkg.activityCategory = isActivity ? activityCategory : null;
  pkg.hotelName = isActivity ? '' : hotelName;
  pkg.offerPrice = isActivity ? 0 : Number(offerPrice) || 0;
  pkg.packageType = isActivity ? '' : packageType;
  pkg.days = transformedDays;
  pkg.operatingHours = operatingHours || '';
  pkg.languages = languages || '';
  pkg.isInstantConfirmation = isInstantConfirmation === 'true' || isInstantConfirmation === true;
  pkg.isNonRefundable = isNonRefundable === 'true' || isNonRefundable === true;

  if (seo) pkg.seo = JSON.parse(seo);
  if (highlights) pkg.highlights = JSON.parse(highlights);

  const isBestPackageBool = String(isBestPackage) === 'true';
  if (isBestPackageBool && bestRank) {
    const targetRank = Number(bestRank);
    if (pkg.bestRank !== targetRank) {
      const existing = await packageRepository.findOne({
        bestRank: targetRank,
        _id: { $ne: pkg._id },
      });
      if (existing) {
        existing.isBestPackage = false;
        existing.bestRank = null;
        await existing.save();
      }
    }
    pkg.isBestPackage = true;
    pkg.bestRank = targetRank;
  } else if (!isBestPackageBool) {
    pkg.isBestPackage = false;
    pkg.bestRank = null;
  }

  return await pkg.save();
};

export const getBestPackages = async (userId) => {
  const bestPackages = await packageRepository.find(
    { type: 'package', isBestPackage: true, isActive: { $ne: false }, isDeleted: { $ne: true } },
    null,
    { lean: true }
  );

  const finalBestPackages = bestPackages.map((pkg) => {
    const userLike = (pkg.likes || []).find((like) => like.userId === userId);
    return {
      ...pkg,
      images: sanitizeImageObjects(pkg.images),
      hotelName: pkg.hotelName || (pkg.rating ? `${pkg.rating} Stars Hotel` : ''),
      userLiked: userLike ? userLike.liked : false,
    };
  });

  finalBestPackages.sort((a, b) => a.bestRank - b.bestRank);
  return finalBestPackages;
};

export const getBestActivities = async (userId) => {
  const bestActivities = await packageRepository.find(
    {
      type: 'activity',
      isBestPackage: true,
      isActive: { $ne: false },
      isDeleted: { $ne: true },
      activityCategory: { $ne: null, $exists: true, $not: /^(none|)$/i },
    },
    null,
    { lean: true }
  );

  const finalBestActivities = bestActivities.map((pkg) => {
    const userLike = (pkg.likes || []).find((like) => like.userId === userId);
    return {
      ...pkg,
      images: sanitizeImageObjects(pkg.images),
      userLiked: userLike ? userLike.liked : false,
    };
  });

  finalBestActivities.sort((a, b) => (a.bestRank || 99) - (b.bestRank || 99));
  return finalBestActivities;
};

export const listPackages = async (queryParams, userId) => {
  const limit = parseInt(queryParams.limit) || 10;
  const lastId = queryParams.lastId;
  const search = queryParams.search;
  const city = queryParams.city;
  const activityCategory = queryParams.activityCategory;
  const onlyActivities = queryParams.onlyActivities === 'true';
  const excludeActivities = queryParams.excludeActivities === 'true';
  const isAdmin = queryParams.isAdmin === 'true';

  const query = isAdmin
    ? { isDeleted: { $ne: true } }
    : { isActive: { $ne: false }, isDeleted: { $ne: true } };
  const andConditions = [];

  if (search) {
    andConditions.push({
      $or: [
        { packageName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { packageType: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (city) {
    andConditions.push({
      $or: [
        { location: { $regex: city, $options: 'i' } },
        { city: { $regex: city, $options: 'i' } },
      ],
    });
  }

  if (activityCategory) {
    andConditions.push({ activityCategory: { $regex: activityCategory, $options: 'i' } });
  }

  if (onlyActivities) {
    andConditions.push({ type: 'activity' });
  } else if (excludeActivities) {
    andConditions.push({ type: 'package' });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  const totalCount = await packageRepository.countDocuments(query);

  if (lastId) {
    if (query.$and) {
      query.$and = [...query.$and, { _id: { $lt: lastId } }];
    } else {
      query.$and = [{ _id: { $lt: lastId } }];
    }
  }

  const packages = await packageRepository.find(query, null, {
    sort: { _id: -1 },
    limit,
    lean: true,
  });

  const finalAllPackages = packages.map((pkg) => {
    const userLike = (pkg.likes || []).find(
      (like) => like.userId?.toString() === userId?.toString()
    );
    return {
      ...pkg,
      images: sanitizeImageObjects(pkg.images),
      hotelName: pkg.hotelName || (pkg.rating ? `${pkg.rating} Stars Hotel` : ''),
      userLiked: userLike ? userLike.liked : false,
    };
  });

  return {
    data: finalAllPackages,
    totalCount,
    nextCursor: packages.length ? packages[packages.length - 1]._id : null,
    hasMore: packages.length === limit,
  };
};

export const getActivityCategories = async () => {
  const dbCategories = await packageRepository.distinct('activityCategory', {
    type: 'activity',
    activityCategory: { $ne: null, $exists: true, $not: /none/i },
    isActive: { $ne: false },
    isDeleted: { $ne: true },
  });

  return Array.from(new Set([...dbCategories, ...PREDEFINED_ACTIVITY_CATEGORIES])).filter(Boolean);
};

export const getLikedPackages = async (userId, queryParams) => {
  if (!userId) {
    return { data: [], totalCount: 0, nextCursor: null, hasMore: false };
  }

  const limit = parseInt(queryParams.limit) || 10;
  const lastId = queryParams.lastId;
  const onlyActivities = queryParams.onlyActivities === 'true';
  const excludeActivities = queryParams.excludeActivities === 'true';

  const query = {
    isActive: { $ne: false },
    isDeleted: { $ne: true },
    likes: { $elemMatch: { userId, liked: true } },
  };

  if (onlyActivities) query.type = 'activity';
  if (excludeActivities) query.type = 'package';

  const totalCount = await packageRepository.countDocuments(query);

  if (lastId) query._id = { $lt: lastId };

  const packages = await packageRepository.find(query, null, {
    sort: { _id: -1 },
    limit,
    lean: true,
  });

  const finalLiked = packages.map((pkg) => ({
    ...pkg,
    images: sanitizeImageObjects(pkg.images),
    hotelName: pkg.hotelName || (pkg.rating ? `${pkg.rating} Stars Hotel` : ''),
    userLiked: true,
  }));

  return {
    data: finalLiked,
    totalCount,
    nextCursor: packages.length ? packages[packages.length - 1]._id : null,
    hasMore: packages.length === limit,
  };
};

export const getLikeCount = async (userId) => {
  const allPackages = await packageRepository.find({ isDeleted: { $ne: true } });
  const finalAllPackages = allPackages.map((pkg) => {
    const userLike = pkg.likes.find((like) => like.userId === userId);
    return {
      ...pkg.toObject(),
      userLiked: userLike ? userLike.liked : false,
    };
  });
  return finalAllPackages.filter((pack) => pack.userLiked).length;
};

export const getSuggestions = async (q) => {
  const queryStr = (q || '').trim();
  if (!queryStr) return { locations: [], packages: [] };

  const limit = 5;
  const packages = await packageRepository.find(
    { packageName: { $regex: queryStr, $options: 'i' }, isDeleted: { $ne: true } },
    'packageName location',
    { limit, lean: true }
  );

  const locationDocs = await packageRepository.find(
    {
      $or: [
        { location: { $regex: queryStr, $options: 'i' } },
        { city: { $regex: queryStr, $options: 'i' } },
      ],
      isDeleted: { $ne: true },
    },
    'location city',
    { limit: 20, lean: true }
  );

  const uniqueLocations = new Set();
  locationDocs.forEach((doc) => {
    const locMatch = doc.location && doc.location.toLowerCase().includes(queryStr.toLowerCase());
    const cityMatch = doc.city && doc.city.toLowerCase().includes(queryStr.toLowerCase());
    if (locMatch) uniqueLocations.add(doc.location);
    if (cityMatch) uniqueLocations.add(doc.city);
  });

  return {
    locations: Array.from(uniqueLocations).slice(0, 3),
    packages,
  };
};

export const getTakenRanks = async () => {
  const packages = await packageRepository.find(
    { isBestPackage: true, bestRank: { $ne: null }, isDeleted: { $ne: true } },
    'bestRank packageName activityCategory type'
  );

  return packages.map((p) => ({
    rank: p.bestRank,
    packageId: p._id,
    packageName: p.packageName,
    isActivity:
      p.type === 'activity' ||
      !!(p.activityCategory && p.activityCategory !== '' && p.activityCategory !== 'none'),
  }));
};

export const getPackageById = async (id) => {
  let currentPackage;
  if (mongoose.isValidObjectId(id)) {
    currentPackage = await packageRepository.findOne({ _id: id, isDeleted: { $ne: true } });
  }

  if (!currentPackage) {
    const decodedId = decodeURIComponent(id).trim();
    const escapedPattern = decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '.*');
    const slugRegex = new RegExp(`^\\s*${escapedPattern}\\s*$`, 'i');
    currentPackage = await packageRepository.findOne({
      packageName: { $regex: slugRegex },
      isDeleted: { $ne: true },
    });
  }

  if (!currentPackage) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  const pkgObj = currentPackage.toObject ? currentPackage.toObject() : currentPackage;
  pkgObj.images = sanitizeImageObjects(pkgObj.images);
  return pkgObj;
};

export const updateRank = async (packageId, bestRank) => {
  const currentPackage = await packageRepository.findById(packageId);
  if (!currentPackage) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  if (bestRank === null || bestRank === '' || bestRank === '0') {
    currentPackage.isBestPackage = false;
    currentPackage.bestRank = null;
    await currentPackage.save();
    return { message: 'Rank removed', data: currentPackage };
  }

  const isCurrentActivity =
    currentPackage.type === 'activity' ||
    !!(
      currentPackage.activityCategory &&
      currentPackage.activityCategory !== '' &&
      currentPackage.activityCategory !== 'none'
    );
  const conflictQuery = {
    bestRank,
    isBestPackage: true,
    _id: { $ne: packageId },
  };

  if (isCurrentActivity) {
    conflictQuery.type = 'activity';
  } else {
    conflictQuery.type = 'package';
  }

  const existingWithRank = await packageRepository.findOne(conflictQuery);

  if (existingWithRank) {
    if (currentPackage.isBestPackage && currentPackage.bestRank) {
      existingWithRank.bestRank = currentPackage.bestRank;
      await existingWithRank.save();
    } else {
      existingWithRank.bestRank = null;
      existingWithRank.isBestPackage = false;
      await existingWithRank.save();
    }
  }

  currentPackage.isBestPackage = true;
  currentPackage.bestRank = bestRank;
  await currentPackage.save();

  return { message: 'Rank updated', data: currentPackage };
};

export const toggleStatus = async (id) => {
  const pkg = await packageRepository.findById(id);
  if (!pkg) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
  pkg.status = newStatus;
  pkg.isActive = newStatus === 'Active';
  await pkg.save();

  return { message: `Package set to ${newStatus}`, data: pkg };
};

export const deletePackage = async (id) => {
  const deletedPackage = await packageRepository.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!deletedPackage) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  return deletedPackage;
};

export const toggleLike = async (userId, id, liked) => {
  if (!userId) {
    const error = new Error('User ID is required');
    error.statusCode = 400;
    throw error;
  }

  const pkg = await packageRepository.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!pkg) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  const userIndex = pkg.likes.findIndex((like) => like.userId === userId);
  let updatedLikes;
  if (userIndex >= 0) {
    pkg.likes[userIndex].liked = liked;
    updatedLikes = pkg.likes;
  } else {
    updatedLikes = [...pkg.likes, { userId, liked }];
  }

  await packageRepository.findByIdAndUpdate(
    id,
    { $set: { likes: updatedLikes } },
    { new: true, runValidators: false }
  );

  return updatedLikes;
};

export const syncFromSheetService = async () => {
  const sheetPackages = await fetchPackagesFromSheet();
  if (!sheetPackages || sheetPackages.length === 0) {
    const error = new Error('No data found in sheet');
    error.statusCode = 400;
    throw error;
  }

  for (const pkgData of sheetPackages) {
    await packageRepository.findOneAndUpdate(
      { packageName: pkgData.packageName },
      { $set: pkgData },
      { upsert: true, new: true }
    );
  }

  return { count: sheetPackages.length };
};

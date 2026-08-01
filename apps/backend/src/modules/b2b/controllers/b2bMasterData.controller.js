import B2BCity from '../models/b2bCity.model.js';
import B2BHotel from '../models/b2bHotel.model.js';
import B2BPackage from '../models/b2bPackage.model.js';
import { sendSuccess } from '#shared/utils/response.js';
import { AppError } from '#shared/errors/AppError.js';

// ─── Cities ──────────────────────────────────────────────────────────────────

export const listCities = async (req, res, next) => {
  try {
    const { q, active } = req.query;
    const filter = {};
    if (active !== 'false') filter.isActive = true;
    if (q) filter.name = { $regex: String(q).trim(), $options: 'i' };

    const cities = await B2BCity.find(filter).sort({ name: 1 }).lean();
    return sendSuccess(res, 200, 'Cities fetched', { data: cities });
  } catch (err) {
    next(err);
  }
};

export const createCity = async (req, res, next) => {
  try {
    const { name, countryCode, region, isActive } = req.body;
    if (!name?.trim() || !countryCode?.trim()) {
      throw new AppError('name and countryCode are required', 400);
    }
    const city = await B2BCity.create({
      name: name.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      region: region?.trim() || '',
      isActive: isActive !== false,
    });
    return sendSuccess(res, 201, 'City created', { data: city.toObject() });
  } catch (err) {
    next(err);
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const updates = {};
    const { name, countryCode, region, isActive } = req.body;
    if (name != null) updates.name = String(name).trim();
    if (countryCode != null) updates.countryCode = String(countryCode).trim().toUpperCase();
    if (region != null) updates.region = String(region).trim();
    if (isActive != null) updates.isActive = Boolean(isActive);

    const city = await B2BCity.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!city) throw new AppError('City not found', 404);
    return sendSuccess(res, 200, 'City updated', { data: city });
  } catch (err) {
    next(err);
  }
};

export const deleteCity = async (req, res, next) => {
  try {
    const city = await B2BCity.findByIdAndDelete(req.params.id).lean();
    if (!city) throw new AppError('City not found', 404);
    return sendSuccess(res, 200, 'City deleted');
  } catch (err) {
    next(err);
  }
};

// ─── Hotels ──────────────────────────────────────────────────────────────────

export const listHotels = async (req, res, next) => {
  try {
    const { cityId, q, active } = req.query;
    const filter = {};
    if (cityId) filter.cityId = cityId;
    if (active !== 'false') filter.isActive = true;
    if (q) filter.name = { $regex: String(q).trim(), $options: 'i' };

    const hotels = await B2BHotel.find(filter)
      .populate('cityId', 'name countryCode')
      .sort({ name: 1 })
      .lean();
    return sendSuccess(res, 200, 'Hotels fetched', { data: hotels });
  } catch (err) {
    next(err);
  }
};

export const createHotel = async (req, res, next) => {
  try {
    const { name, cityId, starRating, baseNightlyRate, currency, notes, isActive } = req.body;
    if (!name?.trim() || !cityId) {
      throw new AppError('name and cityId are required', 400);
    }
    const city = await B2BCity.findById(cityId).lean();
    if (!city) throw new AppError('City not found', 404);

    const hotel = await B2BHotel.create({
      name: name.trim(),
      cityId,
      starRating: starRating || 3,
      baseNightlyRate: Number(baseNightlyRate) || 0,
      currency: currency?.trim() || 'USD',
      notes: notes?.trim() || '',
      isActive: isActive !== false,
    });
    return sendSuccess(res, 201, 'Hotel created', { data: hotel.toObject() });
  } catch (err) {
    next(err);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const updates = {};
    const { name, cityId, starRating, baseNightlyRate, currency, notes, isActive } = req.body;
    if (name != null) updates.name = String(name).trim();
    if (cityId != null) {
      const city = await B2BCity.findById(cityId).lean();
      if (!city) throw new AppError('City not found', 404);
      updates.cityId = cityId;
    }
    if (starRating != null) updates.starRating = Number(starRating);
    if (baseNightlyRate != null) updates.baseNightlyRate = Number(baseNightlyRate);
    if (currency != null) updates.currency = String(currency).trim();
    if (notes != null) updates.notes = String(notes).trim();
    if (isActive != null) updates.isActive = Boolean(isActive);

    const hotel = await B2BHotel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('cityId', 'name countryCode')
      .lean();
    if (!hotel) throw new AppError('Hotel not found', 404);
    return sendSuccess(res, 200, 'Hotel updated', { data: hotel });
  } catch (err) {
    next(err);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await B2BHotel.findByIdAndDelete(req.params.id).lean();
    if (!hotel) throw new AppError('Hotel not found', 404);
    return sendSuccess(res, 200, 'Hotel deleted');
  } catch (err) {
    next(err);
  }
};

// ─── Packages ────────────────────────────────────────────────────────────────

export const listPackages = async (req, res, next) => {
  try {
    const { cityId, q, active } = req.query;
    const filter = {};
    if (cityId) filter.cityId = cityId;
    if (active !== 'false') filter.isActive = true;
    if (q) filter.name = { $regex: String(q).trim(), $options: 'i' };

    const packages = await B2BPackage.find(filter)
      .populate('cityId', 'name countryCode')
      .populate('hotelId', 'name starRating')
      .sort({ name: 1 })
      .lean();
    return sendSuccess(res, 200, 'Packages fetched', { data: packages });
  } catch (err) {
    next(err);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const { name, cityId, hotelId, nights, description, amounts, currency, isActive } = req.body;
    if (!name?.trim() || !cityId) {
      throw new AppError('name and cityId are required', 400);
    }
    const city = await B2BCity.findById(cityId).lean();
    if (!city) throw new AppError('City not found', 404);

    const pkg = await B2BPackage.create({
      name: name.trim(),
      cityId,
      hotelId: hotelId || null,
      nights: Number(nights) || 1,
      description: description?.trim() || '',
      amounts: {
        basePrice: Number(amounts?.basePrice) || 0,
        perNight: Number(amounts?.perNight) || 0,
        transferAddon: Number(amounts?.transferAddon) || 0,
        activityAddon: Number(amounts?.activityAddon) || 0,
      },
      currency: currency?.trim() || 'USD',
      isActive: isActive !== false,
    });
    return sendSuccess(res, 201, 'Package created', { data: pkg.toObject() });
  } catch (err) {
    next(err);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const updates = {};
    const { name, cityId, hotelId, nights, description, amounts, currency, isActive } = req.body;
    if (name != null) updates.name = String(name).trim();
    if (cityId != null) updates.cityId = cityId;
    if (hotelId !== undefined) updates.hotelId = hotelId || null;
    if (nights != null) updates.nights = Number(nights);
    if (description != null) updates.description = String(description).trim();
    if (amounts != null) {
      updates.amounts = {
        basePrice: Number(amounts.basePrice) || 0,
        perNight: Number(amounts.perNight) || 0,
        transferAddon: Number(amounts.transferAddon) || 0,
        activityAddon: Number(amounts.activityAddon) || 0,
      };
    }
    if (currency != null) updates.currency = String(currency).trim();
    if (isActive != null) updates.isActive = Boolean(isActive);

    const pkg = await B2BPackage.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('cityId', 'name countryCode')
      .populate('hotelId', 'name starRating')
      .lean();
    if (!pkg) throw new AppError('Package not found', 404);
    return sendSuccess(res, 200, 'Package updated', { data: pkg });
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const pkg = await B2BPackage.findByIdAndDelete(req.params.id).lean();
    if (!pkg) throw new AppError('Package not found', 404);
    return sendSuccess(res, 200, 'Package deleted');
  } catch (err) {
    next(err);
  }
};

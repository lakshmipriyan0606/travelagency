import Booking from './booking.model.js';

export const create = async (bookingData) => {
  const booking = new Booking(bookingData);
  return await booking.save();
};

export const findSorted = async (filter = {}, sort = { createdAt: -1 }) => {
  return await Booking.find(filter).sort(sort).lean();
};

export const findOneAndUpdate = async (query, update, options = { new: true }) => {
  return await Booking.findOneAndUpdate(query, update, options);
};

export const findByBookingId = async (bookingId) => {
  return await Booking.findOne({ bookingId }).lean();
};

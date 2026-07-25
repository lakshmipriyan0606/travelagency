import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/modules/users/user.model.js';
import Package from '../src/modules/packages/package.model.js';
import Destination from '../src/modules/destinations/destination.model.js';
import Blog from '../src/modules/blogs/blog.model.js';
import Review from '../src/modules/reviews/review.model.js';
import Booking from '../src/modules/bookings/booking.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travelagency';

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing data...');

    await User.deleteMany({});
    await Package.deleteMany({});
    await Destination.deleteMany({});
    await Blog.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});

    console.log('Inserting Admin User...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@travelagency.com',
      password: hashedPassword,
      role: 'superadmin',
      phone: '+1234567890',
      status: 'Active',
      permissions: ['manage_all'],
    });

    console.log('Inserting Destinations...');
    const dest = await Destination.create({
      title: 'Bali',
      location: 'Indonesia',
      url: 'bali-indonesia',
      orderNumber: 1,
      description: 'Tropical paradise',
      imageUrl: 'https://placehold.co/600x400/png',
      status: 'Active',
    });

    console.log('Inserting Packages...');
    const pkg = await Package.create({
      type: 'package',
      packageName: 'Bali Adventure',
      slug: 'bali-adventure',
      packageDescription: 'A 7-day thrilling adventure in Bali.',
      location: dest._id,
      country: 'Indonesia',
      packageType: 'Adventure',
      daysAndNights: '7 Days / 6 Nights',
      price: 1500,
      offerPrice: 1300,
      isBestPackage: true,
      status: 'Active',
      images: [{ url: 'https://placehold.co/800x600/png' }],
      days: [
        {
          dayTitle: 'Day 1: Arrival',
          slots: [
            { slotType: 'Morning', title: 'Airport Pickup', description: 'Welcome to Bali!' },
          ],
        },
      ],
    });

    const act = await Package.create({
      type: 'activity',
      packageName: 'Ubud Jungle Swing',
      slug: 'ubud-jungle-swing',
      packageDescription: 'Experience the famous jungle swing.',
      location: dest._id,
      country: 'Indonesia',
      activityCategory: 'Outdoor',
      daysAndNights: '4 hours',
      price: 50,
      status: 'Active',
      images: [{ url: 'https://placehold.co/800x600/png' }],
    });

    console.log('Inserting Blogs...');
    await Blog.create({
      title: 'Top 10 things to do in Bali',
      slug: 'top-10-things-bali',
      miniDescription: 'A quick guide to the best spots in Bali.',
      content: 'Here are the top 10 things you must do...',
      category: 'Travel',
      thumbnailImage: { url: 'https://placehold.co/400x300/png' },
      bannerImage: { url: 'https://placehold.co/1200x400/png' },
      author: adminUser._id,
      status: 'Published',
    });

    console.log('Inserting Reviews...');
    await Review.create({
      userId: adminUser._id,
      name: 'John Doe',
      location: 'New York, USA',
      profileImage: { url: 'https://placehold.co/100x100/png' },
      title: 'Amazing trip!',
      content: 'The Bali adventure was breathtaking.',
      rating: 5,
      packageId: pkg._id,
      status: 'Published',
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

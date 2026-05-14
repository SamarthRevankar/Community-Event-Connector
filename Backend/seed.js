const { Event, CATEGORIES } = require('./models/Event');

const sampleEvents = [
  {
    title: 'React & Node.js Meetup',
    description:
      'Join us for an evening of talks on full-stack JavaScript development with React and Node.js. Perfect for all skill levels!',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    location: { name: 'TechHub Mumbai', lat: 19.076, lng: 72.8777 },
    category: 'Technology',
    organizerName: 'Mumbai Dev Community',
  },
  {
    title: 'Morning 5K Fun Run',
    description:
      'A friendly 5K fun run through Sanjay Gandhi National Park. Suitable for all fitness levels. Water stations provided.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: { name: 'Sanjay Gandhi National Park Gate 1', lat: 19.2147, lng: 72.9069 },
    category: 'Sports',
    organizerName: 'Mumbai Runners Club',
  },
  {
    title: 'Weekend Watercolour Workshop',
    description:
      'Learn the basics of watercolour painting in this beginner-friendly workshop. All materials provided. Limited to 15 participants.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    location: { name: 'Kala Ghoda Arts Precinct', lat: 18.9281, lng: 72.8326 },
    category: 'Arts',
    organizerName: 'Kala Ghoda Art Society',
  },
  {
    title: 'Street Food Festival',
    description:
      'Explore 40+ local street food vendors, live music, and cooking demonstrations. Family-friendly event with vegetarian options.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: { name: 'Bandra Bandstand Promenade', lat: 19.0596, lng: 72.8295 },
    category: 'Food & Drink',
    organizerName: 'Mumbai Food Fest',
  },
  {
    title: 'Neighbourhood Clean-Up Drive',
    description:
      'Come help us clean up Juhu Beach! Gloves and bags provided. A great way to give back to the community and meet your neighbours.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: { name: 'Juhu Beach, Main Entry', lat: 19.0988, lng: 72.8266 },
    category: 'Community',
    organizerName: 'Clean Mumbai Initiative',
  },
];

const seedDatabase = async () => {
  try {
    const existingCount = await Event.countDocuments();
    if (existingCount > 0) {
      console.log(`📦 Database already has ${existingCount} events — skipping seed.`);
      return;
    }

    await Event.insertMany(sampleEvents);
    console.log(`✅ Seeded ${sampleEvents.length} sample events into the database.`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  }
};

module.exports = { seedDatabase, CATEGORIES };

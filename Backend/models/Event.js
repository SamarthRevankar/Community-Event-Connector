const mongoose = require('mongoose');

const CATEGORIES = [
  'Technology',
  'Sports',
  'Arts',
  'Music',
  'Food & Drink',
  'Education',
  'Health & Wellness',
  'Community',
];

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
      maxlength: [80, 'Organizer name cannot exceed 80 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: attendee count populated from Registration model
eventSchema.virtual('registrations', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'eventId',
  count: false,
});

// Text index for search
eventSchema.index({ title: 'text', description: 'text' });

// Index for date-range queries
eventSchema.index({ date: 1 });

// Index for category filter
eventSchema.index({ category: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = { Event, CATEGORIES };

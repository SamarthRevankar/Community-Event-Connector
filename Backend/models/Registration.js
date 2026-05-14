const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    attendeeName: {
      type: String,
      required: [true, 'Attendee name is required'],
      trim: true,
      maxlength: [80, 'Attendee name cannot exceed 80 characters'],
    },
    attendeeEmail: {
      type: String,
      required: [true, 'Attendee email is required'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      lowercase: true,
    },
    dietaryRestrictions: {
      type: String,
      trim: true,
      maxlength: [200, 'Dietary restrictions cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent same email registering twice for the same event
registrationSchema.index({ eventId: 1, attendeeEmail: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [80, 'Display name cannot exceed 80 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient per-event queries sorted by time
messageSchema.index({ eventId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

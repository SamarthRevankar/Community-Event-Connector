const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { Event } = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/events/:eventId/chat — fetch last 50 messages
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const messages = await Message.find({ eventId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    res.json(messages);
  } catch (err) {
    console.error('Chat fetch error:', err.message);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

// POST /api/events/:eventId/chat — send a message (authenticated)
router.post(
  '/',
  protect,
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 500 })
      .withMessage('Message cannot exceed 500 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', fields: errors.array() });
      }

      const { eventId } = req.params;

      // Verify event exists
      const event = await Event.findById(eventId).lean();
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const msg = await Message.create({
        eventId,
        userId: req.user._id,
        displayName: req.user.name,
        message: req.body.message,
      });

      // Broadcast to all connected clients
      const io = req.app.get('io');
      if (io) {
        io.emit('newMessage', {
          _id: msg._id,
          eventId: msg.eventId,
          userId: msg.userId,
          displayName: msg.displayName,
          message: msg.message,
          createdAt: msg.createdAt,
        });
      }

      res.status(201).json(msg);
    } catch (err) {
      console.error('Chat send error:', err.message);
      res.status(500).json({ error: 'Server error sending message' });
    }
  }
);

module.exports = router;

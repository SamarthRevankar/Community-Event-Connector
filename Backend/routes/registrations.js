const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const { Event } = require('../models/Event');
const router = express.Router({ mergeParams: true });

// POST /api/events/:eventId/registrations
router.post(
  '/',
  [
    body('attendeeName').trim().notEmpty().withMessage('Attendee name is required').isLength({ max: 80 }).withMessage('Name cannot exceed 80 characters'),
    body('attendeeEmail').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
    body('dietaryRestrictions').optional().trim().isLength({ max: 200 }).withMessage('Dietary restrictions cannot exceed 200 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMap = {};
        errors.array().forEach(err => {
          if (!errorMap[err.path]) errorMap[err.path] = err.msg;
        });
        return res.status(422).json({
          error: 'Validation failed',
          fields: errorMap
        });
      }

      const { eventId } = req.params;

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check for duplicate registration
      const existing = await Registration.findOne({ eventId, attendeeEmail: req.body.attendeeEmail });
      if (existing) {
        return res.status(409).json({ error: 'This email is already registered for this event.' });
      }

      const registration = await Registration.create({
        eventId,
        attendeeName: req.body.attendeeName,
        attendeeEmail: req.body.attendeeEmail,
        dietaryRestrictions: req.body.dietaryRestrictions || '',
      });

      // Emit event
      const io = req.app.get('io');
      if (io) io.emit('registrationAdded', { eventId, registration });

      res.status(201).json({
        message: 'Successfully registered for event',
        registration
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'This email is already registered for this event.' });
      }
      res.status(500).json({ error: 'Server error while registering' });
    }
  }
);

// GET /api/events/:eventId/registrations (Optional, to list attendees)
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ eventId }).select('-createdAt -updatedAt -__v').sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching registrations' });
  }
});

module.exports = router;

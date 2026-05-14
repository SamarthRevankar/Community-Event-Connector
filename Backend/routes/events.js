const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { Event, CATEGORIES } = require('../models/Event');

const router = express.Router();

// ── Helper ────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Validation Rules ──────────────────────────────────────
const eventBodyRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date/time'),

  body('location.name')
    .trim()
    .notEmpty().withMessage('Location name is required'),

  body('location.lat')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('location.lng')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('organizerName')
    .trim()
    .notEmpty().withMessage('Organizer name is required')
    .isLength({ max: 80 }).withMessage('Organizer name cannot exceed 80 characters'),
];

// ── GET /api/events ───────────────────────────────────────
// Supports: ?search=, ?category=, ?startDate=, ?endDate=
router.get(
  '/',
  [
    query('search').optional().trim(),
    query('category').optional().trim()
      .isIn(['', ...CATEGORIES]).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    query('startDate').optional().isISO8601().withMessage('startDate must be ISO 8601'),
    query('endDate').optional().isISO8601().withMessage('endDate must be ISO 8601'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { search, category, startDate, endDate } = req.query;
      const filter = {};

      // Full-text search on title + description
      if (search) {
        filter.$text = { $search: search };
      }

      // Category filter
      if (category) {
        filter.category = category;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      const events = await Event.find(filter).sort({ date: 1 }).lean();

      // Attach attendee count from Registration collection (if exists)
      let Registration;
      try {
        Registration = require('../models/Registration');
      } catch {
        Registration = null;
      }

      let eventsWithCount = events;
      if (Registration) {
        const eventIds = events.map((e) => e._id);
        const counts = await Registration.aggregate([
          { $match: { eventId: { $in: eventIds } } },
          { $group: { _id: '$eventId', count: { $sum: 1 } } },
        ]);
        const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
        eventsWithCount = events.map((e) => ({
          ...e,
          attendeeCount: countMap[e._id.toString()] || 0,
        }));
      } else {
        eventsWithCount = events.map((e) => ({ ...e, attendeeCount: 0 }));
      }

      res.json({ success: true, count: eventsWithCount.length, data: eventsWithCount });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/events/:id ───────────────────────────────────
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid event ID')],
  validate,
  async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id).lean();
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // Attach attendee count
      let attendeeCount = 0;
      try {
        const Registration = require('../models/Registration');
        attendeeCount = await Registration.countDocuments({ eventId: event._id });
      } catch {
        // Registration model not yet available (Phase 5)
      }

      res.json({ success: true, data: { ...event, attendeeCount } });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/events ──────────────────────────────────────
router.post('/', eventBodyRules, validate, async (req, res, next) => {
  try {
    const { title, description, date, location, category, organizerName } = req.body;
    const event = await Event.create({ title, description, date, location, category, organizerName });
    
    // Emit event
    const io = req.app.get('io');
    if (io) io.emit('eventCreated', event);
    
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/events/:id ───────────────────────────────────
router.put(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid event ID'), ...eventBodyRules],
  validate,
  async (req, res, next) => {
    try {
      const { title, description, date, location, category, organizerName } = req.body;
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { title, description, date, location, category, organizerName },
        { new: true, runValidators: true }
      );
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      
      // Emit event
      const io = req.app.get('io');
      if (io) io.emit('eventUpdated', event);
      
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/events/:id ────────────────────────────────
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid event ID')],
  validate,
  async (req, res, next) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      // Cascade delete registrations if the model exists
      try {
        const Registration = require('../models/Registration');
        await Registration.deleteMany({ eventId: req.params.id });
      } catch {
        // Not yet available
      }
      
      // Emit event
      const io = req.app.get('io');
      if (io) io.emit('eventDeleted', req.params.id);
      
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

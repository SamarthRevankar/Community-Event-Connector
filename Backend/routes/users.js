const express = require('express');
const { param, validationResult } = require('express-validator');
const User = require('../models/User');
const { Event } = require('../models/Event');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/users/:id — public profile (no email exposed)
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select('name bio avatar createdAt').lean();
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/users/:id/events — events created by this user
router.get(
  '/:id/events',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  async (req, res, next) => {
    try {
      const events = await Event.find({ createdBy: req.params.id })
        .sort({ date: 1 })
        .lean();
      res.json({ success: true, count: events.length, data: events });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

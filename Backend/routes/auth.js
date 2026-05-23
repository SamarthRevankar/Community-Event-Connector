const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    try {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
      const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash: req.body.password });
      const token = signToken(user._id);
      res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      const token = signToken(user._id);
      res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/me
router.put('/me', protect,
  [
    body('name').optional().trim().notEmpty().isLength({ max: 80 }),
    body('bio').optional().trim().isLength({ max: 300 }),
    body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    try {
      const allowed = {};
      if (req.body.name !== undefined) allowed.name = req.body.name;
      if (req.body.bio !== undefined) allowed.bio = req.body.bio;
      if (req.body.avatar !== undefined) allowed.avatar = req.body.avatar;
      const user = await User.findByIdAndUpdate(req.user._id, allowed, { new: true, runValidators: true }).select('-passwordHash');
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/auth/me/password
router.put('/me/password', protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    try {
      const user = await User.findById(req.user._id);
      const valid = await user.comparePassword(req.body.currentPassword);
      if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      user.passwordHash = req.body.newPassword;
      await user.save();
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;

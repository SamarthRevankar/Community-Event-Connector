const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// Disable mongoose buffering — fail fast instead of hanging
mongoose.set('bufferCommands', false);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB connection (cached + awaited per request) ─────
let cachedConnection = null;

const connectDB = async () => {
  // Already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  cachedConnection = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000,  // fail after 8s instead of hanging
    connectTimeoutMS: 8000,
  });

  console.log('✅ MongoDB connected');

  // Auto-seed on first run
  const { seedDatabase } = require('./seed');
  await seedDatabase();

  return cachedConnection;
};

// ── DB connection middleware (runs before every request) ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
      error: err.message,
    });
  }
});

// ── Routes ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Community Event Connector API is running',
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/events', require('./routes/events'));
app.use('/api/events/:eventId/registrations', require('./routes/registrations'));

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Local dev server (not used by Vercel) ────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Events API:   http://localhost:${PORT}/api/events`);
  });
}

// ── CRITICAL: Export app for Vercel serverless ───────────
module.exports = app;

/**
 * BuzzArena Server – Entry Point
 * Express + Socket.IO server with in-memory room state
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const { registerBuzzerHandlers } = require('./sockets/buzzerHandler');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// ─── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api/rooms', roomRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Register all socket event handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  registerBuzzerHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 BuzzArena Server running on http://localhost:${PORT}`);
  console.log(`   Socket.IO ready | CORS: ${CLIENT_URL}\n`);
});

module.exports = { app, server, io };

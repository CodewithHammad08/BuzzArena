/**
 * Room REST Routes
 * POST /api/rooms        – Create a new room
 * GET  /api/rooms/:code  – Get room info (public)
 */

const express = require('express');
const router = express.Router();
const {
  createRoomHandler,
  getRoomHandler,
} = require('../controllers/roomController');

router.post('/', createRoomHandler);
router.get('/:code', getRoomHandler);

module.exports = router;

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Simple admin auth
const adminAuth = (req, res, next) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Admin login
router.post('/login', adminAuth, (req, res) => {
  res.json({ success: true, token: 'admin-token' });
});

// Get ALL messages with tracking data
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sender details
router.get('/sender/:messageId', async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    const senderInfo = {
      message: message.message,
      sentAt: message.createdAt,
      to: message.to,
      tracking: {
        ip: message.ip,
        location: `${message.city || ''} ${message.country || ''}`,
        device: `${message.browser} on ${message.os}`,
        userAgent: message.userAgent
      }
    };
    
    res.json(senderInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

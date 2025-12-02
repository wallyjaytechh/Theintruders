const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const geoip = require('geoip-lite');
const useragent = require('useragent');

// Send anonymous message
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    // Get sender info
    const ip = req.ip || req.connection.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    const location = geoip.lookup(ip);
    
    // Save message WITH TRACKING DATA
    const newMessage = new Message({
      to,
      message,
      ip,
      userAgent: req.headers['user-agent'],
      browser: agent.family,
      os: agent.os.toString(),
      device: agent.device.toString(),
      country: location?.country,
      city: location?.city,
      fingerprint: req.body.fingerprint
    });
    
    await newMessage.save();
    
    res.json({ success: true, message: 'Sent anonymously!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a user
router.get('/:username', async (req, res) => {
  try {
    const messages = await Message.find({ to: req.params.username })
      .select('message createdAt')
      .sort('-createdAt');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

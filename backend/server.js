const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const geoip = require('geoip-lite');
const useragent = require('useragent');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ngl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Import models
const Message = require('./models/Message');
const User = require('./models/User');

// ===== API ROUTES =====

// Send anonymous message
app.post('/api/messages/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    // Get sender tracking data
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    const location = geoip.lookup(ip);
    
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
      fingerprint: req.body.fingerprint || {}
    });
    
    await newMessage.save();
    
    res.json({ success: true, message: 'Sent anonymously!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a user
app.get('/api/messages/:username', async (req, res) => {
  try {
    const messages = await Message.find({ 
      to: req.params.username 
    }).select('message createdAt').sort('-createdAt');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    res.json({ success: true, token: 'admin-vercel-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get all messages (admin)
app.get('/api/admin/messages', async (req, res) => {
  try {
    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('admin')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const messages = await Message.find().sort('-createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PAGE ROUTES =====

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/send/:username', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/send.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Catch-all route for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// For Vercel serverless
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log(`👤 Login: ${process.env.ADMIN_USER} / ${process.env.ADMIN_PASS}`);
  });
}

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  to: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
  // TRACKING DATA (Hidden from recipients)
  ip: String,
  userAgent: String,
  browser: String,
  os: String,
  device: String,
  country: String,
  city: String,
  fingerprint: Object
});

module.exports = mongoose.model('Message', MessageSchema);

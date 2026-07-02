const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);

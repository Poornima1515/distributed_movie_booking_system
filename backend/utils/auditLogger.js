const AuditLog = require('../models/AuditLog');

const logAction = async ({ userId, userName, action, resource, resourceId, details, ip }) => {
  try {
    await AuditLog.create({ user: userId, userName, action, resource, resourceId, details, ip });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { logAction };

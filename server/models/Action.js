const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  type: {
    type: String,
    enum: ['task', 'calendar_event', 'meeting_note', 'reminder', 'decision'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Task-specific fields
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignee: {
    type: String,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Calendar event specific
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  attendees: [{
    type: String
  }],
  // Note specific
  content: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  isStarred: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

actionSchema.index({ user: 1, type: 1 });
actionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Action', actionSchema);

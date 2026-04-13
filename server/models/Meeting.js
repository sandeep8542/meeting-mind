const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Meeting'
  },
  transcript: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  participants: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'completed'
  },
  sentiment: String,
  actions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);
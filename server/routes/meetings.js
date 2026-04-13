const express = require('express');
const router = express.Router();

const {
  getMeetings,
  createMeeting,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  getStats
} = require('../controllers/meetingController');

const auth = require('../middleware/auth');

// Apply auth middleware once
router.use(auth);

// ✅ FIXED ROUTES
router.get('/stats', getStats);
router.get('/', getMeetings);
router.post('/', createMeeting);

router.route('/:id')
  .get(getMeeting)
  .put(updateMeeting)
  .delete(deleteMeeting);

module.exports = router;
const express = require('express');
const router = express.Router();
const { processTranscript, chat, suggestActions } = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/process-transcript', processTranscript);
router.post('/chat', chat);
router.post('/suggest-actions', suggestActions);

module.exports = router;

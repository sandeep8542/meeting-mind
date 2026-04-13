const express = require('express');
const router = express.Router();
const { getActions, updateAction, deleteAction, createAction } = require('../controllers/actionController');
const auth = require('../middleware/auth');

router.use(auth);

router.route('/').get(getActions).post(createAction);
router.route('/:id').put(updateAction).delete(deleteAction);

module.exports = router;

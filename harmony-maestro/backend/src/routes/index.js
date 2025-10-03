// src/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/ping', (req, res) => res.json({ pong: true }));

router.use('/biblioteca', require('./biblioteca'))
router.use('/dashboard', require('./dashboard'));
router.use('/calendar', require('./calendar'));
router.use('/members', require('./members'));
router.use('/songs', require('./songs'));
router.use('/series', require('./series'));
router.use('/events', require('./events'));
router.use('/notifications', require('./notifications'));

module.exports = router;

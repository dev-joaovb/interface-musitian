// src/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/ping', (req, res) => res.json({ pong: true }));

router.use('/register', require('./register'));
router.use('/login', require('./login'));
router.use('/biblioteca', require('./biblioteca'))
router.use('/dashboard', require('./dashboard'));
router.use('/calendar', require('./calendar'));
router.use('/users', require('./users'));
router.use('/series', require('./series'));
router.use('/inviteRoutes', require('./inviteRoutes'));

module.exports = router;

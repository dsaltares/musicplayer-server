const express = require('express');
const passport = require('passport');
const authController = require('./authcontroller');

const googleAuthenticator = passport.authenticate('google', {
    scope: [
        'profile',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
    ]
});

const addSocketIdtoSession = (req, _res, next) => {
    req.session.socketId = req.query.socketId;
    next();
};

const router = express.Router();
router.get('/google', addSocketIdtoSession, googleAuthenticator);
router.get('/google/callback', googleAuthenticator, authController.google);

module.exports = router;

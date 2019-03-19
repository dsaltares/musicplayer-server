const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const Credentials = require('../credentials.json');

module.exports = initPassport;

function initPassport() {
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));

    const callback = (accessToken, refreshToken, profile, cb) => {
        cb(null, { profile, accessToken, refreshToken });
    };

    const GoogleCredentials = Credentials.Google.installed;

    passport.use(new GoogleStrategy({
        clientID: GoogleCredentials.client_id,
        clientSecret: GoogleCredentials.client_secret,
        callbackURL: 'http://localhost:8080/auth/google/callback'
    }, callback));
}

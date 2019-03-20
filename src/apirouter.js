const express = require('express');
const { google } = require('googleapis');
const { promisify } = require('util');
const ApiController = require('./apicontroller');
const OAuth2Client = require('./oauth2client');
const Store = require('./trackstore');
const LastFM = require('./lastfm');
const Credentials = require('../credentials.json');

const apiController = ApiController({
    getStore: async token => {
        const client = await OAuth2Client(Credentials.Google, token);
        const drive = google.drive({
            version: 'v3',
            auth: client
        });
        const promisifiedDrive = {
            list: promisify(drive.files.list),
            get: promisify(drive.files.get)
        };
        return Store(promisifiedDrive);
    },
    getLastFM: () => {
        return LastFM(Credentials.LastFM);
    }
});

const router = express.Router();

router.get('/tracks', apiController.processTracksRequest);
router.get('/track', apiController.processTrackRequest);

module.exports = router;

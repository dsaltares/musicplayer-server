const fs = require('fs');
const express = require('express');
const { google } = require('googleapis');
const { promisify } = require('util');
const Processor = require('./requestprocessor');
const OAuth2Client = require('./oauth2client');
const Store = require('./trackstore');
const LastFM = require('./lastfm');

const googleCredentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
const lastFmApiKey = fs.readFileSync('lastfm_api_key.txt', 'utf-8').trim();

const processor = Processor({
    getStore: async token => {
        const client = await OAuth2Client(googleCredentials, token);
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
        return LastFM(lastFmApiKey);
    }
});

const router = express.Router();

router.get('/tracks', processor.processTracksRequest);
router.get('/track', processor.processTrackRequest);

const app = express();
const port = 8080;
app.use('/api', router);
app.listen(port);
console.log(`Server started and listening to requests on port ${port}`);

const fs = require('fs');
const express = require('express');
const Processor = require('./requestprocessor');

const googleCredentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
const lastFmApiKey = fs.readFileSync('lastfm_api_key.txt', 'utf-8').trim();
const processor = Processor({
    googleCredentials,
    lastFmApiKey
});

const router = express.Router();

router.get('/tracks', processor.processTracksRequest);
router.get('/track', processor.processTrackRequest);

const app = express();
const port = 8080;
app.use('/api', router);
app.listen(port);
console.log(`Server started and listening to requests on port ${port}`);

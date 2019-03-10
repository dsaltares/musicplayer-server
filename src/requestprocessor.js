module.exports = create;

const OAuth2Client = require('./oauth2client');
const LastFM = require('./lastfm');
const Store = require('./trackstore');
const path = require('path');

function create(deps) {
    return {
        processTracksRequest: processTracksRequest.bind(null, deps),
        processTrackRequest: processTrackRequest.bind(null, deps)
    };
}

async function processTracksRequest(deps, req, res) {
    const token = JSON.parse(req.headers['googledrive']);

    try {
        const client = await OAuth2Client(deps.googleCredentials, token);
        const store = Store(client);
        const tracks = await store.getTracks();
        const lastFm = LastFM(deps.lastFmApiKey);
        const metadataParams = tracks.map(track => {
            const parts = track.name.split(' - ');
            return {
                artist: parts[0],
                track: path.basename(parts[1], '.mp3')
            };
        });
        const metadata = await lastFm.metadataForTracks(metadataParams);
        const tracksWithMetadata = tracks.map((track, index) => {
            return { ...track, ...metadata[index] };
        });
        res.json({ tracks: tracksWithMetadata });
    } catch (err) {
        const errorMsg = 'Failed to get tracks';
        res.json({
            error: {
                msg: errorMsg
            }
        });
        console.log(errorMsg, err);
    }
}

async function processTrackRequest(deps, req, res) {
    const token = JSON.parse(req.headers['googledrive']);

    try {
        const client = await OAuth2Client(deps.googleCredentials, token);
        const trackId = req.query.id;
        const store = Store(client);
        await store.getTrack(trackId, res);
    } catch (err) {
        const errorMsg = 'Failed to get track';
        res.json({
            error: {
                msg: errorMsg
            }
        });
    }
}


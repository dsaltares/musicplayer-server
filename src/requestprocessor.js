module.exports = create;

const path = require('path');

function create(deps) {
    return {
        processTracksRequest: processTracksRequest.bind(null, deps),
        processTrackRequest: processTrackRequest.bind(null, deps)
    };
}

async function processTracksRequest(deps, req, res) {
    try {
        const token = getGoogleToken(req);
        const store = await deps.getStore(token);
        const tracks = await store.getTracks();
        const lastFm = deps.getLastFM();
        const metadata = await getTracksMetadata(lastFm, tracks);
        const tracksWithMetadata = mergeTracksWithMetadata(tracks, metadata);
        res.json({ tracks: tracksWithMetadata });
    } catch (err) {
        sendErrorResponse(res, `Failed to get tracks: ${err.msg}`);
    }
}

async function processTrackRequest(deps, req, res) {
    try {
        const token = getGoogleToken(req);
        const trackId = req.query.id;
        const store = await deps.getStore(token);
        const track = await store.getTrack(trackId);
        track.pipe(res);
    } catch (err) {
        sendErrorResponse(res, `Failed to get track: ${err.msg}`);
    }
}

function getGoogleToken(req) {
    if (!req.headers.hasOwnProperty('google_token')) {
        throw new Error('No google drive token provided');
    }
    return JSON.parse(req.headers['google_token']);
}

async function getTracksMetadata(lastFm, tracks) {
    const metadataParams = tracks.map(track => {
        const parts = track.name.split(' - ');
        return {
            artist: parts[0],
            track: path.basename(parts[1], '.mp3')
        };
    });
    return lastFm.metadataForTracks(metadataParams);
}

function mergeTracksWithMetadata(tracks, metadata) {
    return tracks.map((track, index) => {
        return { ...track, ...metadata[index] };
    });
}

function sendErrorResponse(res, msg) {
    console.log(msg);
    res.json({
        error: { msg }
    });
}

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
        if (!req.headers.hasOwnProperty('googledrive')) {
            throw new Error('No google drive token provided');
        }
        const token = JSON.parse(req.headers['googledrive']);
        const store = await deps.getStore(token);
        const tracks = await store.getTracks();
        const lastFm = deps.getLastFM();
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
        const errorMsg = `Failed to get tracks: ${err.msg}`;
        res.json({
            error: {
                msg: errorMsg
            }
        });
        console.log(errorMsg, err);
    }
}

async function processTrackRequest(deps, req, res) {
    try {
        if (!req.headers.hasOwnProperty('googledrive')) {
            throw new Error('No google drive token provided');
        }
        const token = JSON.parse(req.headers['googledrive']);
        const trackId = req.query.id;
        const store = await deps.getStore(token);
        const track = await store.getTrack(trackId);
        track.pipe(res);
    } catch (err) {
        const errorMsg = `Failed to get track: ${err.msg}`;
        res.json({
            error: {
                msg: errorMsg
            }
        });
    }
}


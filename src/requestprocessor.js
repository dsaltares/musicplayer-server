module.exports = {
    processTracksRequest,
    processTrackRequest
};

const makeOAuth2Client = require('./makeoauth2client');
const { store } = require('./trackstore');

async function processTracksRequest(req, res) {
    const token = JSON.parse(req.headers['googledrive']);

    try {
        const client = await makeOAuth2Client(token);
        const tracks = await store.getTracks(client, client);

        res.json({ tracks });
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

async function processTrackRequest(req, res) {
    const token = JSON.parse(req.headers['googledrive']);

    try {
        const client = await makeOAuth2Client(token);
        const trackId = req.query.id;
        await store.getTrack(client, trackId, res);
    } catch (err) {
        const errorMsg = 'Failed to get track';
        res.json({
            error: {
                msg: errorMsg
            }
        });
    }
}

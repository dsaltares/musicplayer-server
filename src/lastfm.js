module.exports = create;

const axios = require('axios');

function create(apiKey) {
    return {
        metadataForTrack: metadataForTrack.bind(null, apiKey),
        metadataForTracks: metadataForTracks.bind(null, apiKey)
    };
}

async function metadataForTrack(apiKey, artist, track) {
    const url = 'http://ws.audioscrobbler.com/2.0';
    const res = await axios.get(url, {
        params: {
            method: 'track.getInfo',
            api_key: apiKey,
            format: 'json',
            artist,
            track
        }
    });

    return res.data.track;
}

function metadataForTracks(apiKey, tracks) {
    const requests = tracks.map(
        track => metadataForTrack(apiKey, track.artist, track.track)
    );
    return Promise.all(requests);
}

module.exports = create;

const axios = require('axios');

function create(apiKey) {
    return {
        metadataForTrack: metadataForTrack.bind(null, apiKey),
        metadataForTracks: metadataForTracks.bind(null, apiKey)
    };
}

async function metadataForTrack(apiKey, artist, track) {
    try {
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

        if (!res || !res.data || res.data.error || !res.data.track) {
            return {};
        }

        return res.data.track;
    } catch (err) {
        console.log('Failed to get metadata for artist: ', artist, ' track: ', track, ' error: ', err.msg);
        return {};
    }
}

function metadataForTracks(apiKey, tracks) {
    const requests = tracks.map(
        track => metadataForTrack(apiKey, track.artist, track.track)
    );
    return Promise.all(requests);
}

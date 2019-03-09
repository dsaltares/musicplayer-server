const { google } = require('googleapis');
const { promisify } = require('util');
const path = require('path');

module.exports = {
    makeStore
};

function makeStore(client) {
    return {
        getTracks: getTracks.bind(null, client),
        getTrack: getTrack.bind(null, client)
    };
}

async function getTracks(client) {
    const drive = getDrive(client);
    const list = promisify(drive.files.list);
    const folderId = await getTracksFolderId(list);
    const tracks = await getTracksInFolder(list, folderId);
    return tracks.map(track => {
        return {
            name: path.basename(track.name, '.mp3'),
            id: track.id
        };
    });
}

async function getTrack(client, trackId, dest) {
    const drive = getDrive(client);
    const get = promisify(drive.files.get);
    const res = await get(
        { fileId: trackId, alt: 'media' },
        { responseType: 'stream' }
    );
    return res.data.pipe(dest);
}

function getDrive(client) {
    return google.drive({
        version: 'v3',
        auth: client
    });
}

async function getTracksFolderId(list) {
    const res = await list({
        mimType: 'application/vnd.google-apps.folder',
        q: 'name = "musicplayer"',
        fields: 'files(id, name)'
    });
    return res.data.files[0].id;
}

async function getTracksInFolder(list, folderId) {
    const res = await list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)'
    });
    return res.data.files;
}

const path = require('path');

module.exports = create;

function create(drive) {
    return {
        getTracks: getTracks.bind(null, drive),
        getTrack: getTrack.bind(null, drive)
    };
}

async function getTracks(drive) {
    const folderId = await getTracksFolderId(drive);
    const tracks = await getTracksInFolder(drive, folderId);
    return tracks.map(track => {
        return {
            name: path.basename(track.name, '.mp3'),
            id: track.id
        };
    });
}

async function getTrack(drive, trackId) {
    const res = await drive.get(
        { fileId: trackId, alt: 'media' },
        { responseType: 'stream' }
    );
    return res.data;
}

async function getTracksFolderId(drive) {
    const res = await drive.list({
        mimType: 'application/vnd.google-apps.folder',
        q: 'name = "musicplayer"',
        fields: 'files(id, name)'
    });

    if (res.data.files.length > 0) {
        return res.data.files[0].id;
    }
}

async function getTracksInFolder(drive, folderId) {
    if (!folderId) {
        return [];
    }
    const res = await drive.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)'
    });
    return res.data.files;
}

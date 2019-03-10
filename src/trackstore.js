module.exports = create;

const path = require('path');

const ValidTrackRegex = /^[^-]* - [^-]*.mp3$/;

function create(drive) {
    return {
        getTracks: getTracks.bind(null, drive),
        getTrack: getTrack.bind(null, drive)
    };
}

async function getTracks(drive) {
    const folderId = await getFolderId(drive, 'musicplayer');
    const files = await getFilesInFolder(drive, folderId);
    return files
        .filter(file => ValidTrackRegex.test(file.name))
        .map(file => {
            return {
                name: path.basename(file.name, '.mp3'),
                id: file.id
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

async function getFolderId(drive, folderName) {
    const res = await drive.list({
        mimType: 'application/vnd.google-apps.folder',
        q: `name = "${folderName}"`,
        fields: 'files(id, name)'
    });

    return res.data.files.length > 0 ?
        res.data.files[0].id :
        undefined;
}

async function getFilesInFolder(drive, folderId) {
    if (!folderId) {
        return [];
    }
    const res = await drive.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)'
    });
    return res.data.files;
}

const express = require('express');
const fs = require('fs');
const path = require('path');
const musicMetadata = require('music-metadata');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);

const router = express.Router();
const tracksFolder = 'static';

router.get('/', (_req, res) => {
    res.json({
        message: 'It works!'
    });
});

router.get('/tracks', (_req, res) => {
    readdir(tracksFolder).then(files => {
        const trackPromises = files.filter(file => {
            return file.endsWith('.mp3');
        }).map(file => {
            const fullPath = path.join(tracksFolder, file);
            return musicMetadata.parseFile(fullPath).catch(err => {
                console.log('Failed to parse metadata for ', fullPath, ' error ', err);
            });
        });
        Promise.all(trackPromises).then(tracks => {
            const validTracks = tracks.filter(track => !!track);
            res.json({
                tracks: validTracks
            });
        });
    }).catch(err => {
        const errorMsg = 'Failed to get tracks';
        res.json({
            error: {
                msg: errorMsg
            }
        });
        console.log(errorMsg, err);
    });
});

router.get('/track', (req, res) => {
    const track = req.query.id;
    const file = path.join(tracksFolder, track);
    exists(file).then(fileExists => {
        if (fileExists) {
            const stream = fs.createReadStream(file);
            stream.pipe(res);
        } else {
            res.json({
                error: {
                    msg: 'File not found'
                }
            });
        }
    });
});

const app = express();
const port = 8080;
app.use('/api', router);
app.listen(port);
console.log(`Server started and listening to requests on port ${port}`);

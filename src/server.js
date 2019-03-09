const express = require('express');
const fs = require('fs');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);

const router = express.Router();

router.get('/', (_req, res) => {
    res.json({
        message: 'It works!'
    });
});

router.get('/tracks', (_req, res) => {
    readdir('static').then(files => {
        const tracks = files.filter(file => {
            return file.endsWith('.mp3');
        }).map(file => {
            return { file };
        });
        res.json({ tracks });
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

const app = express();
const port = 8080;
app.use('/api', router);
app.listen(port);
console.log(`Server started and listening to requests on port ${port}`);

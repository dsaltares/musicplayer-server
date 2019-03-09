const express = require('express');
const processor = require('./requestprocessor');

const router = express.Router();

router.get('/tracks', processor.processTracksRequest);
router.get('/track', processor.processTrackRequest);

const app = express();
const port = 8080;
app.use('/api', router);
app.listen(port);
console.log(`Server started and listening to requests on port ${port}`);

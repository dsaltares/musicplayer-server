const express = require('express');

const router = express.Router();

router.get('/', (_req, res) => {
    res.json({
        message: 'It works!'
    });
});

const app = express();
const port = 8080;
app.use('/api', router);
app.listen(port);
console.log(`Server started and listening to requests on port ${port}`);

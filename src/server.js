const http = require('http');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const socketio = require('socket.io');
const initPassport = require('./initpassport');
const authRouter = require('./authrouter');
const apiRouter = require('./apirouter');
const Credentials = require('../credentials.json');

const app = express();
const server = http.Server(app);

app.use(express.json());
app.use(passport.initialize());
initPassport();

app.use(cors({
    origin: [ 'http://localhost:3000' ]
}));

app.use(session({
    secret: Credentials.SessionSecret,
    resave: true,
    saveUninitialized: true
}));

const io = socketio(server);
app.set('io', io);

app.use('/api', apiRouter);
app.use('/auth', authRouter);

const port = 8080;
server.listen(port, () => {
    console.log(`Server started and listening to requests on port ${port}`);
});

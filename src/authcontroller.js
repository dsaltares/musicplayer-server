module.exports.google = google;

function google(req) {
    const io = req.app.get('io');
    const profile = req.user.profile;
    const accessToken = JSON.stringify({
        access_token: req.user.accessToken,
        refresh_token: req.user.refreshToken
    });
    io.in(req.session.socketId).emit('google', {
        profile,
        accessToken
    });
}

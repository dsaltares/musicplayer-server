const { google } = require('googleapis');

module.exports = makeOAuth2Client;

async function makeOAuth2Client(credentials, token) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    if (token) {
        client.setCredentials(token);
    }

    return client;
}

const fs = require('fs');
const { google } = require('googleapis');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

module.exports = makeOAuth2Client;

async function makeOAuth2Client(token) {
    const content = await readFile('credentials.json');
    const credentials = JSON.parse(content);
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

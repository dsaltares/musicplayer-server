const OAuth2Client = require('./oauth2client');
const readline = require('readline');
const Credentials = require('../credentials.json');

getAndShowGoogleToken();

async function getAndShowGoogleToken() {
    const client = await OAuth2Client(Credentials.Google);
    const code = await promptForCode(client);
    const token = await getToken(client, code);

    console.log(`Authorisation token: ${JSON.stringify(token)}`);
}

function promptForCode(client) {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'profile',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/drive.readonly'
        ]
    });
    console.log('Visit the following URL to get a Google Drive access token: ', authUrl);

    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the authorisation code: ', code => {
            rl.close();
            resolve(code);
        });
    });
}

function getToken(client, code) {
    return new Promise((resolve, reject) => {
        client.getToken(code, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

const OAuth2Client = require('./oauth2client');
const readline = require('readline');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

getAndShowGoogleToken();

async function getAndShowGoogleToken() {
    const content = await readFile('credentials.json');
    const credentials = JSON.parse(content);
    const client = await OAuth2Client(credentials);
    const code = await promptForCode(client);
    const token = await getToken(client, code);

    console.log(`Authorisation token: ${JSON.stringify(token)}`);
}

function promptForCode(client) {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
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

# musicplayer-server

[![Build Status](https://travis-ci.org/dsaltares/musicplayer-server.svg?branch=master)](https://travis-ci.org/dsaltares/musicplayer-server)
[![codecov](https://codecov.io/gh/dsaltares/musicplayer-server/branch/master/graph/badge.svg)](https://codecov.io/gh/dsaltares/musicplayer-server)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=dsaltares_musicplayer-server&metric=alert_status)](https://sonarcloud.io/dashboard?id=dsaltares_musicplayer-server)

Backend for a simple music player app written in [Node.js](https://nodejs.org/en/) using [Express](https://expressjs.com/). It gets a list of tracks from a folder in the user's Google Drive account and fetches track metadata from [Last.fm](https://www.last.fm/api).

You will find the frontend in [dsaltares/musicplayer-ui](https://github.com/dsaltares/musicplayer-ui).

## Setup

To get started, install the service dependencies.

```bash
npm install
```

## Tests and linting

The service uses [Jest](https://jestjs.io/) as its testing Framework, to run tests and get a coverage report you can simply:

```bash
npm run test
```

For linting.

```bash
npm run lint
```

## Running the service

Create a `credentials.json` file in the root of the repository.

```
{}
```

* Get an API account for Last.fm [here](https://www.last.fm/api/account/create), copy the key and put it in the `LastFM` property
* Download the Google Drive client configuration from [Google's quickstart guide](https://developers.google.com/drive/api/v3/quickstart/nodejs). Set its contents to the `Google` property.
* Generate a [session key](https://randomkeygen.com/) and add it to the `SessionSecret` property.

The file should look like:

```json
{
    "Google": {
        "installed": {
            "client_id": "client_id",
            "project_id": "project_id",
            "auth_uri": "auth_uri",
            "token_uri": "token_uri",
            "auth_provider_x509_cert_url": "auth_provider_x509_cert_url",
            "client_secret": "client_secret",
            "redirect_uris": [
                "redirect_uris"
            ]
        }
    },
    "LastFM": "last_fm_key",
    "SessionSecret": "session_secret"
}
```

Now you can run the service via:

```bash
npm run start
```

You should see this in your console:

```bash
Server started and listening to requests on port 8080
```

It is now accessible via `http://localhost:8080`.

## Sending requests

First, you need to obtain and authorization token to allow the service to access your Google Drive files (read-only). In order to do that:

1. Run `node src/getgoogletoken.js`
2. Visit the URL it outputs and authorize the application.
3. Copy the code and paste it into the script prompt.
4. Copy and save the final script output.

You can now easily send requests to the service using [Postman](https://www.getpostman.com/) and importing the `musicplayer.postman_collection.json` file in the repository root.

You need to setup an environment variable called `google_token` and set its value to the output of the `getgoogletoken.js` script.

![postman-steps](./img/postman_steps.gif)

## API methods

The API only supports the `get` method.

### `/api/tracks`

Retrieves all tracks inside the `musicplayer` folder in your Google Drive account that match the `Artist - Track Name.mp3` pattern. It then enriches the list with Last.fm metadata.

#### Params

* `google_token`: the Google Drive authorization token for the user. Not that this should really be sent via https.

#### Sample Response

```json
{
    "tracks": [
        {
            "name": "Used Me",
            "id": "1VTENXdyQ8NclpQcpscrQjcjMrXKkX52G",
            "url": "https://www.last.fm/music/The+Spin+Wires/_/Used+Me",
            "duration": "306000",
            "streamable": {
                "#text": "0",
                "fulltrack": "0"
            },
            "listeners": "45",
            "playcount": "214",
            "artist": {
                "name": "The Spin Wires",
                "url": "https://www.last.fm/music/The+Spin+Wires"
            },
            "album": {
                "artist": "The Spin Wires",
                "title": "The Spin Wires",
                "url": "https://www.last.fm/music/The+Spin+Wires/The+Spin+Wires",
                "image": [
                    {
                        "#text": "https://lastfm-img2.akamaized.net/i/u/34s/1379c42585c9765db7eaf4fda718f1df.png",
                        "size": "small"
                    },
                    {
                        "#text": "https://lastfm-img2.akamaized.net/i/u/64s/1379c42585c9765db7eaf4fda718f1df.png",
                        "size": "medium"
                    },
                    {
                        "#text": "https://lastfm-img2.akamaized.net/i/u/174s/1379c42585c9765db7eaf4fda718f1df.png",
                        "size": "large"
                    },
                    {
                        "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/1379c42585c9765db7eaf4fda718f1df.png",
                        "size": "extralarge"
                    }
                ]
            },
            "toptags": {
                "tag": [
                    {
                        "name": "alternative rock",
                        "url": "https://www.last.fm/tag/alternative+rock"
                    },
                    {
                        "name": "indie rock",
                        "url": "https://www.last.fm/tag/indie+rock"
                    }
                ]
            }
        }
    ]
}
```

#### Errors

In case of error, the service will return.

```json
{
    "error": {
        "msg": "Error message"
    }
}
```

### `/api/track`

Returns the mp3 stream for the given track id.

#### Params

* `id`: the Google Drive file id as returned by the `tracks` request.
* `google_token`: the Google Drive authorization token for the user.

#### Errors

In case of error, the service will return.

```json
{
    "error": {
        "msg": "Error message"
    }
}
```

### `/auth/google`

Initiates the OAuth2 authentication process with Google. The server expects a socket connection to exist already.

#### Params

* `socketId`: the id of the socket connection between client-server.

### Sample response

The client will receive a `google` socket message with the following contents.

```json
{
    "profile": {
        "provider": "google",
        "id": "id",
        "displayName": "display name",
        "name": {
            "givenName": "name",
            "familyName": "surname"
        },
        "language": "en-GB",
        "gender": "gender",
        "picture": "url"
        ...
    },
    "accessToken": "token"
}
```

## Potential improvements

### Technical

* HTTPS
* Better error handling with documented error codes.
* Higher unit test coverage.
* Integration tests.
* Decent logging and metrics for telemetry.
* Load tests.
* Healthchecks.
* Use environment variables for keys instead of config files.


### Features

* Configurable Google Drive folder.
* Different storage options: local, Dropbox...
* Ability to fetch lyrics.
* Pagination for large collections: at the moment, it only fetches the first page of Google Drive result (100 entries).

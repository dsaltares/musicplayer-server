const LastFM = require('./lastfm');
const axios = require('axios');

beforeEach(() => {
    jest.resetAllMocks();
});

it('can be instantiated without crashing', () => {
    const apiKey = 'key';
    const lastFm = LastFM(apiKey);

    expect(lastFm).toBeDefined();
});

it('metadataForTrack - successfully fetches metadata', async () => {
    const apiKey = 'key';
    const lastFm = LastFM(apiKey);

    const expectedMetadata = {
        albumCover: 'cover',
        year: 2019
    };
    axios.get.mockImplementationOnce(() =>
        Promise.resolve({
            data: {
                track: expectedMetadata
            }
        })
    );

    const metadata = await lastFm.metadataForTrack('artist', 'track');

    expect(metadata).toEqual(expectedMetadata);
    expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        {
            params: {
                method: expect.any(String),
                api_key: apiKey,
                format: 'json',
                artist: 'artist',
                track: 'track'
            }
        }
    );
});

it('metadataForTrack - returns empty object if the track is not found', async () => {
    const apiKey = 'key';
    const lastFm = LastFM(apiKey);

    axios.get.mockImplementationOnce(() =>
        Promise.resolve({
            data: {
                error: 6
            }
        })
    );

    const metadata = await lastFm.metadataForTrack('artist', 'track');

    expect(metadata).toEqual({});
});

it('metadataForTrack - returns empty object the lastFM request fails', async () => {
    const apiKey = 'key';
    const lastFm = LastFM(apiKey);

    axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error('Failed to send request'))
    );

    const metadata = await lastFm.metadataForTrack('artist', 'track');

    expect(metadata).toEqual({});
});

it('metadataForTracks - successfully returns metadata for all tracks', async () => {
    const apiKey = 'key';
    const lastFm = LastFM(apiKey);

    const expectedMetadatas = [
        {
            albumCover: 'cover_1',
            year: 2019
        },
        {
            albumCover: 'cover_2',
            year: 2018
        },
        {
            albumCover: 'cover_3',
            year: 2017
        }
    ];

    expectedMetadatas.forEach(metadata => {
        axios.get.mockImplementationOnce(() =>
            Promise.resolve({
                data: {
                    track: metadata
                }
            })
        );
    });

    const trackParams = [
        { artist: 'artist_1', track: 'track_1' },
        { artist: 'artist_2', track: 'track_2' },
        { artist: 'artist_3', track: 'track_3' }
    ];

    const metadatas = await lastFm.metadataForTracks(trackParams);

    expect(metadatas).toEqual(expectedMetadatas);
    expect(axios.get).toHaveBeenCalledTimes(3);
});

it('metadataForTracks - successfully returns metadata even if some tracks fail', async () => {
    const apiKey = 'key';
    const lastFm = LastFM(apiKey);

    const validMetadata = {
        albumCover: 'cover_1',
        year: 2019
    };
    const emptyMetadata = {};
    const expectedMetadatas = [ validMetadata, emptyMetadata ];

    axios.get.mockImplementationOnce(() =>
        Promise.resolve({
            data: {
                track: validMetadata
            }
        })
    );

    axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error('Failed to send request'))
    );

    const trackParams = [
        { artist: 'artist_1', track: 'track_1' },
        { artist: 'artist_2', track: 'track_2' }
    ];

    const metadatas = await lastFm.metadataForTracks(trackParams);

    expect(metadatas).toEqual(expectedMetadatas);
    expect(axios.get).toHaveBeenCalledTimes(2);
});

const Processor = require('./requestprocessor');

it('can be instantiated without crashing', () => {
    const processor = Processor({});
    expect(processor).toBeDefined();
});

it('getTracks - error response when no googledrive token is present in the header', async () => {
    const deps = {};
    const processor = Processor(deps);
    const req = {
        headers: {}
    };
    const res = makeRes();

    await processor.processTracksRequest(req, res);

    expect(res.json).toHaveBeenCalledWith({
        error: {
            msg: expect.any(String)
        }
    });
});

it('getTracks - error response when the track store rejects', async () => {
    const store = {
        getTracks: jest.fn().mockRejectedValue(new Error('Store error'))
    };
    const deps = makeDeps(store);
    const processor = Processor(deps);
    const req = {
        headers: { googledrive: '{}' }
    };
    const res = makeRes();

    await processor.processTracksRequest(req, res);

    expect(store.getTracks).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
        error: {
            msg: expect.any(String)
        }
    });
});

it('getTracks - error response when LastFM rejects', async () => {
    const store = {
        getTracks: jest.fn().mockResolvedValue([
            {
                id: 'track_1',
                name: 'Artist 1 - Title 1.mp3'
            },
            {
                id: 'track_2',
                name: 'Artist 2 - Title 2.mp3'
            }
        ])
    };
    const lastFM = {
        metadataForTracks: jest.fn().mockRejectedValue(new Error('LastFM Error'))
    };
    const deps = makeDeps(store, lastFM);
    const processor = Processor(deps);
    const req = {
        headers: { googledrive: '{}' }
    };
    const res = makeRes();

    await processor.processTracksRequest(req, res);

    expect(store.getTracks).toHaveBeenCalled();
    expect(lastFM.metadataForTracks).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
        error: {
            msg: expect.any(String)
        }
    });
});

it('getTracks - returns tracks and metadata successfully', async () => {
    const store = {
        getTracks: jest.fn().mockResolvedValue([
            {
                id: 'track_1',
                name: 'Artist 1 - Title 1.mp3'
            },
            {
                id: 'track_2',
                name: 'Artist 2 - Title 2.mp3'
            }
        ])
    };
    const lastFM = {
        metadataForTracks: jest.fn().mockResolvedValue([
            { album: 'Album 1' },
            { album: 'Album 2' }
        ])
    };
    const deps = makeDeps(store, lastFM);
    const processor = Processor(deps);
    const req = {
        headers: { googledrive: '{}' }
    };
    const res = makeRes();

    await processor.processTracksRequest(req, res);

    expect(store.getTracks).toHaveBeenCalled();
    expect(lastFM.metadataForTracks).toHaveBeenCalledWith([
        {
            artist: 'Artist 1',
            track: 'Title 1'
        },
        {
            artist: 'Artist 2',
            track: 'Title 2'
        }
    ]);
    expect(res.json).toHaveBeenCalledWith({
        tracks: [
            {
                id: 'track_1',
                name: 'Artist 1 - Title 1.mp3',
                album: 'Album 1'
            },
            {
                id: 'track_2',
                name: 'Artist 2 - Title 2.mp3',
                album: 'Album 2'
            }
        ]
    });
});

it('getTracks - skips badly formed file names', async () => {
    const store = {
        getTracks: jest.fn().mockResolvedValue([
            {
                id: 'track_1',
                name: 'Artist 1 - Title 1.mp3'
            },
            {
                id: 'track_2',
                name: 'Bad name.ogg'
            }
        ])
    };
    const lastFM = {
        metadataForTracks: jest.fn().mockResolvedValue([
            { album: 'Album 1' },
            { album: 'Album 2' }
        ])
    };
    const deps = makeDeps(store, lastFM);
    const processor = Processor(deps);
    const req = {
        headers: { googledrive: '{}' }
    };
    const res = makeRes();

    await processor.processTracksRequest(req, res);

    expect(store.getTracks).toHaveBeenCalled();
    expect(lastFM.metadataForTracks).toHaveBeenCalledWith([
        {
            artist: 'Artist 1',
            track: 'Title 1'
        }
    ]);
    expect(res.json).toHaveBeenCalledWith({
        tracks: [
            {
                id: 'track_1',
                name: 'Artist 1 - Title 1.mp3',
                album: 'Album 1'
            }
        ]
    });
});

it('getTrack - error response when no googledrive token is present in the header', async () => {
    const deps = {};
    const processor = Processor(deps);
    const req = {
        query: { id: 'track_1' },
        headers: {}
    };
    const res = makeRes();

    await processor.processTrackRequest(req, res);

    expect(res.json).toHaveBeenCalledWith({
        error: {
            msg: expect.any(String)
        }
    });
});

it('getTrack - error response when the track store rejects', async () => {
    const store = {
        getTrack: jest.fn().mockRejectedValue(new Error('Store error'))
    };
    const deps = makeDeps(store);
    const processor = Processor(deps);
    const req = {
        query: { id: 'track_1' },
        headers: { googledrive: '{}' }
    };
    const res = makeRes();

    await processor.processTrackRequest(req, res);

    expect(store.getTrack).toHaveBeenCalledWith('track_1');
    expect(res.json).toHaveBeenCalledWith({
        error: {
            msg: expect.any(String)
        }
    });
});

it('getTrack - pipes the track into the response', async () => {
    const track = {
        pipe: jest.fn()
    };
    const store = {
        getTrack: jest.fn().mockResolvedValue(track)
    };
    const deps = makeDeps(store);
    const processor = Processor(deps);
    const req = {
        query: { id: 'track_1' },
        headers: { googledrive: '{}' }
    };
    const res = makeRes();

    await processor.processTrackRequest(req, res);

    expect(store.getTrack).toHaveBeenCalledWith('track_1');
    expect(track.pipe).toHaveBeenCalledWith(res);
    expect(res.json).not.toHaveBeenCalled();
});

function makeRes() {
    return {
        json: jest.fn()
    };
}

function makeDeps(store, lastFM) {
    return {
        getStore: () => store,
        getLastFM: () => lastFM
    };
}


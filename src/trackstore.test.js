const Store = require('./trackstore');

beforeEach(() => {
    jest.restoreAllMocks();
});

it('can be instantiated without crashing', () => {
    const drive = {};
    const store = Store(drive);
    expect(store).toBeDefined();
});

it('getTracks - successfully returns tracks in folder', async () => {
    const drive = {
        list: jest
            .fn()
            .mockResolvedValue({
                data: {
                    files: [
                        { id: 'music_folder' }
                    ]
                }
            })
            .mockResolvedValue({
                data: {
                    files: [
                        { id: 'track_1', name: 'Artist 1 - Track 1.mp3' },
                        { id: 'track_2', name: 'Artist 2 - Track 2.mp3' }
                    ]
                }
            })
    };
    const store = Store(drive);

    const tracks = await store.getTracks();

    expect(tracks).toEqual([
        { id: 'track_1', name: 'Artist 1 - Track 1' },
        { id: 'track_2', name: 'Artist 2 - Track 2' }
    ]);
    expect(drive.list).toHaveBeenCalledTimes(2);
});

it('getTracks - filters out badly formatted files', async () => {
    const drive = {
        list: jest
            .fn()
            .mockResolvedValue({
                data: {
                    files: [
                        { id: 'music_folder' }
                    ]
                }
            })
            .mockResolvedValue({
                data: {
                    files: [
                        { id: 'track_1', name: 'Artist 1 - Track 1.mp3' },
                        { id: 'bad_track', name: 'Bad Track.mp3' },
                        { id: 'track_2', name: 'Artist 2 - Track 2.mp3' },
                        { id: 'bad_format', name: 'Artist 3 - Track 3.ogg' }
                    ]
                }
            })
    };
    const store = Store(drive);

    const tracks = await store.getTracks();

    expect(tracks).toEqual([
        { id: 'track_1', name: 'Artist 1 - Track 1' },
        { id: 'track_2', name: 'Artist 2 - Track 2' }
    ]);
    expect(drive.list).toHaveBeenCalledTimes(2);
});

it('getTracks - handles not finding a music folder', async () => {
    const drive = {
        list: jest.fn().mockResolvedValue({
            data: { files: [] }
        })
    };
    const store = Store(drive);

    const tracks = await store.getTracks();

    expect(tracks).toEqual([]);
    expect(drive.list).toHaveBeenCalledTimes(1);
});

it('getTracks - throws if the Google API throws', async () => {
    const drive = {
        list: jest.fn().mockRejectedValue(new Error('Failed to list'))
    };
    const store = Store(drive);

    expect(store.getTracks()).rejects.toThrow('Failed to list');
});

it('getTrack - successfully returns track by id', async () => {
    const drive = {
        get: jest.fn().mockResolvedValue({
            data: 'track_data'
        })
    };
    const store = Store(drive);

    const track = await store.getTrack('track_id');

    expect(track).toEqual('track_data');
    expect(drive.get).toHaveBeenCalledWith(
        { fileId: 'track_id', alt: 'media' },
        { responseType: 'stream' }
    );
});

it('getTrack - throws if the Google API throws', async () => {
    const drive = {
        get: jest.fn().mockRejectedValue(new Error('Failed to get file'))
    };
    const store = Store(drive);

    expect(store.getTrack('track_id')).rejects.toThrow('Failed to get file');
});

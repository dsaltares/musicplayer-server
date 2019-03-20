const controller = require('./authcontroller');

it('sends profile and access token info via socket', () => {
    const emitter = {
        emit: jest.fn()
    };
    const io = {
        in: jest.fn().mockReturnValue(emitter)
    };
    const req = {
        app: {
            get: jest.fn().mockReturnValue(io)
        },
        user: {
            profile: 'profile',
            accessToken: 'access',
            refreshToken: 'refresh'
        },
        session: {
            socketId: 'socket'
        }
    };

    controller.google(req);

    const expectedAccessToken = JSON.stringify({
        access_token: 'access',
        refresh_token: 'refresh'
    });

    expect(io.in).toHaveBeenCalledWith('socket');
    expect(emitter.emit).toHaveBeenCalledWith('google', {
        profile: 'profile',
        accessToken: expectedAccessToken
    });
});

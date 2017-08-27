const { HueApi } = require('node-hue-api');

const isConfigured = config => !!config.hue && !!config.hue.ip;

const setup = async({ hue }) => {
    const api = new HueApi(hue.ip, hue.username);
    if (!hue.username) {
        const user = await api.registerUser(hue.ip, 'dashdown');
        hue.username = user;
    }
    return api;
};

const shutdown = async api => {
    const { lights } = await api.lights();
    await Promise.all(lights.map(({ id }) =>
        api.setLightState(id, { on: false })));
};

module.exports = {
    isConfigured,
    setup,
    shutdown
};

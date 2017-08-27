const YamahaAPI = require('yamaha-nodejs');

const isConfigured = config => !!config.avr;

const setup = async({ avr }) => {
    const api = new YamahaAPI(avr);
    return api;
};

const shutdown = async api => {
    await api.powerOff();
};

module.exports = {
    isConfigured,
    setup,
    shutdown
};

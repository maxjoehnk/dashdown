const { exec } = require('child_process');

const isConfigured = config => !!config.cec;

const run = cmd => new Promise((resolve, reject) => {
    exec(`echo "${cmd}" | cec-client -s`, err => {
        if (err) {
            reject(err);
        }
        resolve();
    });
});

const setup = async({ cec }) => cec;

const shutdown = async address => {
    await run(`standby ${address}`);
};

module.exports = {
    isConfigured,
    setup,
    shutdown
};

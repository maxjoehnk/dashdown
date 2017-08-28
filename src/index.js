const DashButton = require('node-dash-button');
const { join } = require('path');
const { load, save } = require('./config');
const cec = require('./integrations/hdmi-cec');
const hue = require('./integrations/philips-hue');
const yamaha = require('./integrations/yamaha');

const configPath = join(__dirname, '../config.json');

const onDashButton = targets => () => {
    targets.forEach(({ integration, config }) =>
        integration.shutdown(config)
            .catch(err => console.error(err))
    );
};

const setupIntegration = (name, integration) => async({ config, services = [] }) => {
    if (integration.isConfigured(config)) {
        try {
            const instance = await integration.setup(config);
            services.push({
                integration,
                config: instance
            });
        }catch (err) {
            console.error(`Error setting up ${name} integration`);
        }
    }
    return {
        config,
        services
    };
};

const setup = ({ config: path = configPath }) => 
    load(path)
        .then(config => {
            if (!config.dash) {
                throw new Error('Please add the mac address of your dash button');
            }
            return { config };
        })
        .then(setupIntegration('yamaha', yamaha))
        .then(setupIntegration('hue', hue))
        .then(setupIntegration('hdmi-cec', cec))
        .then(({ config, services }) => {
            const dash = DashButton(config.dash, null, null, 'all'); // eslint-disable-line new-cap
            dash.on('detected', onDashButton(services));
            return config;
        })
        .then(config => save(path, config))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });

module.exports = {
    setup,
    setupIntegration
};

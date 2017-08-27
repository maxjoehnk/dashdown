const DashButton = require('node-dash-button');
const { join } = require('path');
const { load, save } = require('./config');
const cec = require('./integrations/hdmi-cec');
const hue = require('./integrations/philips-hue');
const yamaha = require('./integrations/yamaha');

const configPath = join(__dirname, '../config.json');

let dash;

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

const setup = () => {
    load(configPath)
        .then(config => {
            if (!config.dash) {
                throw 'Please add the mac address of your dash button';
            }
            return { config };
        })
        .then(setupIntegration('yamaha', yamaha))
        .then(setupIntegration('hue', hue))
        .then(setupIntegration('hdmi-cec', cec))
        .then(({ config, services }) => {
            dash = DashButton(config.dash, null, null, 'all'); // eslint-disable-line new-cap
            dash.on('detected', onDashButton(services));
            return config;
        })
        .then(config => save(configPath, config))
        .then(() => console.log('Setup Complete'))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
};

setup();

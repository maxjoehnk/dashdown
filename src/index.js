const DashButton = require('node-dash-button');
const YamahaAPI = require('yamaha-nodejs');
const { join } = require('path');
const { load, save } = require('./config');
const { HueApi } = require('node-hue-api');
const map = require('lodash.map');
const { exec } = require('child_process');

const configPath = join(__dirname, '../config.json');

let avr;
let hue;
let dash;

const onDashButton = config => () => {
    if (avr) {
        avr.powerOff();
    }
    if (hue) {
        hue.lights()
            .then(res => res.lights)
            .then(lights => Promise.all(map(lights, ({ id }) => hue.setLightState(id, { on: false }))))
            .catch(err => console.error(err));
    }
    if (config.cec) {
        exec(`echo "standby ${config.cec}" | cec-client -s`, err => {
            if (err) {
                console.error(err);
            }
        });
    }
};

const setup = () => {
    load(configPath)
        .then(config => {
            if (!config.dash) {
                throw 'Please add the mac address of your dash button';
            }
            return config;
        })
        .then(config => {
            dash = DashButton(config.dash, null, null, 'all'); // eslint-disable-line new-cap
            dash.on('detected', onDashButton(config));
            return config;
        })
        .then(config => {
            if (config.avr) {
                avr = new YamahaAPI(config.avr);
            }else {
                avr = new YamahaAPI();
            }
            return config;
        })
        .then(config => {
            if (config.hue) {
                hue = new HueApi(config.hue.ip, config.hue.username);
                if (!config.hue.username) {
                    return hue.registerUser(config.hue.ip, 'dashdown')
                        .then(user => {
                            config.hue.username = user;
                        })
                        .then(() => save(configPath, config));
                }
            }
        })
        .then(() => console.log('Setup Complete'))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
};

setup();

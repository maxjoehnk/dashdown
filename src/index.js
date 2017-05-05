const DashButton = require('node-dash-button');
const YamahaAPI = require("yamaha-nodejs");
const { readFile, writeFile } = require('fs');
const { join } = require('path');
const { HueApi } = require('node-hue-api');
const map = require('lodash.map');

let config = {};

let avr;
let hue;
let dash;

const load = () => new Promise((resolve, reject) => {
    readFile(join(__dirname, '../config.json'), 'utf8', (err, content) => {
        if (err) {
            return reject(err);
        }
        config = JSON.parse(content);
        resolve(config);
    });
});

const save = () => new Promise((resolve, reject) => {
    writeFile(join(__dirname, '../config.json'), JSON.stringify(config), err => {
        if (err) {
            return reject(err);
        }
        resolve();
    });
});

const onDashButton = () => {
    if (avr) {
        avr.powerOff();
    }
    if (hue) {
        hue.lights()
            .then(res => res.lights)
            .then(lights => Promise.all(map(lights, ({ id }) => hue.setLightState(id, { on: false }))))
            .catch(err => console.error(err));
    }
};

const setup = () => {
    load()
        .then(() => {
            if (!config.dash) {
                throw 'Please add the mac address of your dash button';
            }
        })
        .then(() => {
            dash = DashButton(config.dash, null, null, 'all');
            dash.on('detected', onDashButton);
        })
        .then(() => {
            if (config.avr) {
                avr = new YamahaAPI(config.avr);
            }else {
                avr = new YamahaAPI();
            }
        })
        .then(() => {
            if (config.hue) {
                hue = new HueApi(config.hue.ip, config.hue.username);
                if (!config.hue.username) {
                    return hue.registerUser(config.hue.ip, 'dashdown')
                        .then(user => {
                            config.hue.username = user;
                        })
                        .then(save);
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

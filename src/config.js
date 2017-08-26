const { readFile, writeFile } = require('fs');

const load = path => new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, content) => {
        if (err) {
            return reject(err);
        }
        const config = JSON.parse(content);
        resolve(config);
    });
});

const save = (path, config) => new Promise((resolve, reject) => {
    writeFile(path, JSON.stringify(config), err => {
        if (err) {
            return reject(err);
        }
        resolve();
    });
});

module.exports = {
    load,
    save
};

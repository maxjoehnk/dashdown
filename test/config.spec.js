const { expect, use } = require('chai');
const { stub, match } = require('sinon');
const { enable, disable, registerMock, registerAllowable } = require('mockery');
const asPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

use(asPromised);
use(sinonChai);

const requirePath = '../src/config';

describe('config', function() {
    let fsMock;
    let config;

    before(function() {
        enable({
            useCleanCache: true
        });
        fsMock = {
            readFile: stub(),
            writeFile: stub()
        };
        registerMock('fs', fsMock);
        registerAllowable(requirePath);

        config = require(requirePath);
    });

    after(function() {
        disable();
    });

    it('should be an object', function() {
        expect(config).to.be.an.instanceof(Object);
    });

    describe('load', function() {
        it('should be defined', function() {
            expect(config.load).to.be.an.instanceof(Function);
        });

        it('should return a promise', function() {
            const result = config.load('');
            expect(result).to.be.an.instanceof(Promise);
        });

        it('should read the file with utf8 encoding', function() {
            const file = '/config.yml';
            config.load(file);
            expect(fsMock.readFile).to.have.been.calledWith(file, 'utf8', match.func);
        });

        it('should resolve when the readFile callback is called without error', function() {
            const result = {
                test: 4
            };
            const content = JSON.stringify(result);
            fsMock.readFile.callsFake((path, options, cb) => {
                cb(null, content);
            });
            const file = '/config.yml';
            expect(config.load(file)).to.eventually.eql(result);
        });

        it('should reject when the readFile callback is called with an error', function() {
            fsMock.readFile.callsFake((path, options, cb) => {
                cb(new Error('Test'));
            });
            const file = '/config.yml';
            expect(config.load(file)).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('save', function() {
        it('should be defined', function() {
            expect(config.save).to.be.an.instanceof(Function);
        });

        it('should return a promise', function() {
            const result = config.save('', {});
            expect(result).to.be.an.instanceof(Promise);
        });

        it('should write the file with stringified content', function() {
            const file = '/config.yml';
            const content = {
                test: 4
            };
            config.save(file, content);
            expect(fsMock.writeFile).to.have.been.calledWith(file, JSON.stringify(content), match.func);
        });

        it('should resolve when the writeFile callback is called without error', function() {
            fsMock.writeFile.callsFake((path, content, cb) => {
                cb(null);
            });
            const file = '/config.yml';
            const content = {};
            expect(config.save(file, content)).to.eventually.be.fulfilled;
        });

        it('should reject when the writeFile callback is called with an error', function() {
            fsMock.writeFile.callsFake((path, content, cb) => {
                cb(new Error('Test'));
            });
            const file = '/config.yml';
            const content = {};
            expect(config.save(file, content)).to.eventually.be.rejectedWith(Error);
        });
    });
});

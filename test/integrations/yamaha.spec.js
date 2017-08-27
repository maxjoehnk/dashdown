const { expect, use } = require('chai');
const { stub } = require('sinon');
const { enable, disable, registerMock, registerAllowable } = require('mockery');
const asPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

use(asPromised);
use(sinonChai);

const requirePath = '../../src/integrations/yamaha';

describe('integrations/yamaha', function() {
    let integration;
    let avrMock;
    let avrInstance;

    before(function() {
        enable({
            useCleanCache: true
        });
        avrMock = stub();
        avrInstance = {
            powerOff: stub()
        };
        avrMock.returns(avrInstance);
        registerMock('yamaha-nodejs', avrMock);
        registerAllowable(requirePath);

        integration = require(requirePath);
    });

    after(function() {
        disable();
    });

    it('should be an object', function() {
        expect(integration).to.be.an.instanceof(Object);
    });

    describe('setup', function() {
        it('should be defined', function() {
            expect(integration.setup).to.be.an.instanceof(Function);
        });

        it('should return a promise', function() {
            const result = integration.setup({});
            expect(result).to.be.an.instanceof(Promise);
        });

        it('should return an yamaha instance', function() {
            const config = {
                avr: '127.0.0.1'
            };
            const result = integration.setup(config);
            expect(avrMock).to.have.been.calledWith(config.avr);
            expect(result).to.eventually.eql(avrInstance);
        });
    });

    describe('shutdown', function() {
        it('should be defined', function() {
            expect(integration.shutdown).to.be.an.instanceof(Function);
        });

        it('should resolve when avr.powerOff resolves', async function() {
            avrInstance.powerOff.resolves();
            const result = integration.shutdown(avrInstance);
            expect(result).to.eventually.be.fulfilled;
            expect(avrInstance.powerOff).to.have.been.called;
        });

        it('should reject when avr.powerOff rejects', async function() {
            avrInstance.powerOff.rejects(new Error());
            const result = integration.shutdown(avrInstance);
            expect(result).to.eventually.have.been.rejectedWith(Error);
        });
    });

    describe('isConfigured', function() {
        it('should be defined', function() {
            expect(integration.isConfigured).to.be.an.instanceof(Function);
        });

        it('should return true when avr is set', function() {
            const config = {
                avr: '127.0.0.1'
            };
            const result = integration.isConfigured(config);
            expect(result).to.be.true;
        });

        it('should return false when avr is not set', function() {
            const config = {};
            const result = integration.isConfigured(config);
            expect(result).to.be.false;
        });
    });
});

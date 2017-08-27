const { expect, use } = require('chai');
const { stub, match } = require('sinon');
const { enable, disable, registerMock, registerAllowable } = require('mockery');
const asPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

use(asPromised);
use(sinonChai);

const requirePath = '../../lib/integrations/hdmi-cec';

describe('integrations/hdmi-cec', function() {
    let childProcessMock;
    let integration;

    before(function() {
        enable({
            useCleanCache: true
        });
        childProcessMock = {
            exec: stub()
        };
        registerMock('child_process', childProcessMock);
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

        it('should return the cec address', function() {
            const cec = '0:0:0:0';
            const config = {
                cec
            };
            expect(integration.setup(config)).to.eventually.eql(cec);
        });
    });

    describe('shutdown', function() {
        it('should be defined', function() {
            expect(integration.shutdown).to.be.an.instanceof(Function);
        });

        it('should return a promise', function() {
            const result = integration.shutdown('');
            expect(result).to.be.an.instanceof(Promise);
        });

        it('should call child_process.exec', function() {
            integration.shutdown('0:0:0:0');
            expect(childProcessMock.exec).to.have.been.calledWith('echo "standby 0:0:0:0" | cec-client -s', match.func);
        });

        it('should resolve when child_process.exec calls back', function() {
            childProcessMock.exec.callsArgWith(1, null);
            const result = integration.shutdown('0:0:0:0');
            expect(result).to.eventually.be.fulfilled;
        });

        it('should reject when child_process.exec errors', function() {
            const err = new Error('Fail');
            childProcessMock.exec.callsArgWith(1, err);
            const result = integration.shutdown('0:0:0:0');
            expect(result).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('isConfigured', function() {
        it('should be defined', function() {
            expect(integration.isConfigured).to.be.an.instanceof(Function);
        });

        it('should return true when cec is set', function() {
            const config = {
                cec: '0:0:0:0'
            };
            const result = integration.isConfigured(config);
            expect(result).to.be.true;
        });

        it('should return false when cec is not set', function() {
            const config = {};
            const result = integration.isConfigured(config);
            expect(result).to.be.false;
        });
    });
});

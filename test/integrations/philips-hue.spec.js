const { expect, use } = require('chai');
const { stub } = require('sinon');
const { enable, disable, registerMock, registerAllowable } = require('mockery');
const asPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

use(asPromised);
use(sinonChai);

const requirePath = '../../lib/integrations/philips-hue';

describe('integrations/philips-hue', function() {
    let hueMock;
    let hueInstance;
    let integration;

    before(function() {
        enable({
            useCleanCache: true
        });
        hueMock = {
            HueApi: stub()
        };
        hueInstance = {
            registerUser: stub(),
            setLightState: stub(),
            lights: stub()
        };
        hueMock.HueApi.returns(hueInstance);
        registerMock('node-hue-api', hueMock);
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
            const result = integration.setup({ hue: {} });
            expect(result).to.be.an.instanceof(Promise);
        });

        it('should return a hue api instance', function() {
            const config = {
                hue: {
                    ip: '',
                    username: ''
                }
            };
            const result = integration.setup(config);
            expect(result).to.eventually.eql(hueInstance);
        });

        it('should register a user if not done before', function() {
            const config = {
                hue: {
                    ip: '127.0.0.1'
                }
            };
            integration.setup(config);
            expect(hueInstance.registerUser).to.have.been.calledWith(config.hue.ip, 'dashdown');
        });
    });

    describe('shutdown', function() {
        it('should be defined', function() {
            expect(integration.shutdown).to.be.an.instanceof(Function);
        });

        it('should fetch all lights', function() {
            hueInstance.lights.resolves({ lights: [] });
            integration.shutdown(hueInstance);
            expect(hueInstance.lights).to.have.been.called;
        });

        it('should call setLightState for each light', function() {
            const lights = [{
                id: 1
            }, {
                id: 2
            }];
            hueInstance.lights.resolves({ lights });
            hueInstance.setLightState.resolves();
            return integration.shutdown(hueInstance)
                .then(() => {
                    expect(hueInstance.setLightState).to.have.been.calledWith(1, { on: false });
                    expect(hueInstance.setLightState).to.have.been.calledWith(2, { on: false });                            
                });
        });
    });

    describe('isConfigured', function() {
        it('should be defined', function() {
            expect(integration.isConfigured).to.be.an.instanceof(Function);
        });

        it('should return true when hue.ip is set', function() {
            const config = {
                hue: {
                    ip: '127.0.0.1'
                }
            };
            const result = integration.isConfigured(config);
            expect(result).to.be.true;
        });

        it('should return false when hue.ip is not set', function() {
            const config = {
                hue: {}
            };
            const result = integration.isConfigured(config);
            expect(result).to.be.false;
        });

        it('should return false when hue is not set', function() {
            const config = {};
            const result = integration.isConfigured(config);
            expect(result).to.be.false;
        });
    });
});

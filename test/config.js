var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinonChai = require('sinon-chai'),
    sinon = require('sinon'),
    Q = require('q');

// Leave chai.should setup above loading our plugin to ensure
// that we test the re-establishing of chai.should with our custom handler.
chai.should();

chai.use(sinonChai);

chai.use(require('../lib/chai-missing-assertions'));

// Leave chai-as-promised loading after our plugin to ensure that we still tie
// into plugins that are loaded after we are.
chai.use(chaiAsPromised);

//////////////
// CHAI Config
//////////////
global.chai = chai;
global.err = function (fn, msg) {
    try {
        fn();
        throw new chai.AssertionError({ message: 'Expected an error' });
    } catch (err) {
        if ('string' === typeof msg) {
            chai.expect(err.message).to.equal(msg);
        } else {
            chai.expect(err.message).to.match(msg);
        }
    }
};


//////////////////////////
// Chai-As-Promised Config
//////////////////////////
global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.fulfilledPromise = Q.resolve;
global.rejectedPromise = Q.reject;
global.defer = Q.defer;

Q.longStackSupport = true;
global.shouldPass = function (promiseProducer) {
    it('should return a fulfilled promise', function (done) {
        promiseProducer().then(
            function () {
                done();
            },
            function (reason) {
                done(new Error('Expected promise to be fulfilled but it was rejected with ' + reason.stack));
            }
        );
    });
};

global.shouldFail = function (options) {
    var promiseProducer = options.op;
    var desiredMessageSubstring = options.message;

    it('should return a promise rejected with an assertion error', function (done) {
        promiseProducer().then(function () {
            done(new Error('Expected promise to be rejected with an assertion error, but it was fulfilled'));
        }, function (reason) {
            if (Object(reason) !== reason || reason.constructor.name !== 'AssertionError') {
                done(new Error('Expected promise to be rejected with an AssertionError but it was rejected with ' +
                               reason));
            } else {
                if (desiredMessageSubstring && reason.message.indexOf(desiredMessageSubstring) === -1) {
                    done(new Error('Expected promise to be rejected with an AssertionError containing \'' +
                                   desiredMessageSubstring + '\' but it was rejected with ' + reason));
                } else {
                    done();
                }
            }
        });
    });
};


/////////////
// sinon-chai
/////////////
global.sinon = sinon;
global.swallow = function (thrower) {
    try {
        thrower();
    } catch (e) { }
};

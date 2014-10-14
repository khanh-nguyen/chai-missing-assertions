'use strict';

var expectjs = require('expect.js'),
    chai = require('chai'),
    q = require('q'),
    assertionTypes = require('./utils/assertion-types');

describe('normal operations', function() {
    assertionTypes(function(assert) {
        it('should not throw errors for positive getter property assertions', function() {
            return assert(true).to.be.true;
        });

        it('should throw errors for negative getter property assertions', function() {
            expectjs(function() {
                return assert(true).to.be.false;
            }).to.throwError();
        });

        it('should not throw errors for positive method assertions', function() {
            return assert([1,2,3]).to.include(1);
        });

        it('should throw errors for negative method assertions', function() {
            expectjs(function() {
                return assert([1,2,3]).to.include(4);
            }).to.throwError();
        });

        it('should not throw errors for method chaining of positive assertions', function() {
            return assert([1,2,3]).is.an('array').and.include(1);
        });

        it('should throw errors for method chaining of negative assertions', function() {
            expectjs(function() {
                return assert([1,2,3]).is.an('array').and.include(4);
            }).to.throwError();
        });

        it('should not throw errors for positive assertions from chai plugins like chai-as-promised', function(done) {
            function checkResult(err) {
                try {
                    expectjs(err).to.equal(undefined);
                    done();
                }
                catch (e) {
                }
            }
            var deferred = q.defer();
            assert(deferred.promise).to.eventually.be.fulfilled.and.notify(checkResult);
            deferred.resolve(true);
        });

        it('should throw errors for negative assertions from chai plugins like chai-as-promised', function(done) {
            function checkResult(err) {
                try {
                    expectjs(err).to.be.an(Error);
                    done();
                }
                catch (e) {
                }
            }

            var deferred = q.defer();
            assert(deferred.promise).to.eventually.be.rejected.and.notify(checkResult);
            deferred.resolve(true);
        });
    });
});

describe('proxy functions', function() {
    assertionTypes(function(assert) {
        it('should proxy the `set` method back to the proxied object', function() {
            var assertion = assert(true).to.be;
            assertion.foo = 'bar';
            expectjs(assertion.foo).to.equal('bar');
        });

        it('should proxy the `has` method back to the proxied object', function() {
            var assertion = assert(true).to.be,
                properties = [],
                name;

            assertion.foo = 'bar';
            for (name in assertion) {
                properties.push(name);
            }

            expectjs(properties.indexOf('foo')).to.be.above(-1);
        });

        it('should proxy the `enumerate` method to the proxied object', function() {
            var assertion = assert(true).to.be,
                properties = Object.keys(assertion);

            expectjs(properties.length).to.be.above(0);
        });
    });

    it('should skip proxying properties that are not configurable', function() {
        chai.use(function(_chai) {
            Object.defineProperty(_chai.Assertion.prototype, 'no_overwrite', {
                get: function() {},
                configurable: false
            });
        });
    });
});

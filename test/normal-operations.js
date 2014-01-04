'use strict';

var expectjs = require('expect.js'),
    chai = require('chai'),
    q = require('q'),
    assertionTypes = require('./utils/assertion-types');

describe('normal operations', function() {
    assertionTypes(function(assert) {
        it('should not throw errors for positive getter property assertions', function() {
            assert(true).to.be.true;
        });

        it('should throw errors for negative getter property assertions', function() {
            expectjs(function() {
                assert(true).to.be.false;
            }).to.throwError();
        });

        it('should not throw errors for positive method assertions', function() {
            assert([1,2,3]).to.include(1);
        });

        it('should throw errors for negative method assertions', function() {
            expectjs(function() {
                assert([1,2,3]).to.include(4);
            }).to.throwError();
        });

        it('should not throw errors for method chaining of positive assertions', function() {
            assert([1,2,3]).is.an('array').and.include(1);
        });

        it('should throw errors for method chaining of negative assertions', function() {
            expectjs(function() {
                assert([1,2,3]).is.an('array').and.include(4);
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

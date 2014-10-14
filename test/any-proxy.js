'use strict';

var expectjs = require('expect.js'),
    _ = require('lodash'),
    q = require('q'),
    chaiMissingAssertions = require('../index'),
    assertionTypes = require('./utils/assertion-types'),
    availableProxies = require('../lib/available-proxies');

if (availableProxies.any) {
    describe('missing assertions - any proxy', function() {
        assertionTypes(function(assert) {
            it('should throw an error when an undefined assertion property is accessed after a chainable property', function() {
                expectjs(function() {
                    return assert([1, 2, 3]).to.include(1).and.to.be.an('array').toBeAnArrayOfSizeThree;
                }).to.throwError(/toBeAnArrayOfSizeThree/);
            });

            it('should throw an error when an undefined assertion property is accessed after a chainable method property', function() {
                expectjs(function() {
                    return assert('one, two, and three').to.contain.theTextTwo;
                }).to.throwError(/theTextTwo/);
            });

            it('should throw an error when an undefined assertion property is accessed after a method property', function() {
                expectjs(function() {
                    return assert(true).to.be.true.and.treu;
                }).to.throwError(/treu/);
            });

            it('should throw and error when an undefined assertion property is accessed after a method', function() {
                expectjs(function() {
                    return assert(true).to.equal(true).treu;
                }).to.throwError(/treu/);
            });

            it('should only throw exceptions when attributes are undefined, not falsy', function() {
                var assertion = assert(true).to.equal(true);
                assertion.bar = false;
                expectjs(function() {
                    return assertion.bar;
                }).to.not.throwError();

                assertion.bar = null;
                expectjs(function() {
                    return assertion.bar;
                }).to.not.throwError();

                delete assertion.bar;
                expectjs(function() {
                    return assertion.bar;
                }).to.throwError(/bar/);
            });

            it('should not proxy properties that are already proxies', function() {
                var stack = '';
                try {
                    return assert(q()).to.eventually.be.fulfilled.fooo;
                }
                catch (e) {
                    stack = e.stack;
                }

                stack = _.filter(stack.split('\n'), function(line) {
                        return (/missingChaiAssertionProxy/.test(line));
                    });

                expectjs(stack.length).to.equal(1);
            });

            it('should allow ignoring potentially undefined properties', function() {
                var missingProperty = 'potentially_missing';
                function missingPropertyTest() {
                    return assert(true).to[missingProperty];
                }

                expectjs(missingPropertyTest).to.throwError();
                chaiMissingAssertions.ignore(missingProperty);
                expectjs(missingPropertyTest).to.not.throwError();
                chaiMissingAssertions.unignore(missingProperty);
            });
        });
    });

    describe('proxy functions - any proxy', function() {
        assertionTypes(function(assert) {
            it('should proxy the `delete` method to the proxied object', function() {
                var assertion = assert(true).to.be;
                assertion.bar = 'baz';
                expectjs(assertion.bar).to.equal('baz');
                delete assertion.bar;
                expectjs(function() {
                    return assertion.bar;
                }).to.throwError(/bar/);
            });
        });
    });
}

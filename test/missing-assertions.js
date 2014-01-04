'use strict';

var expectjs = require('expect.js'),
    chai = require('chai'),
    _ = require('lodash'),
    q = require('q'),
    chaiMissingAssertions = require('../lib/chai-missing-assertions'),
    assertionTypes = require('./utils/assertion-types');

describe('missing assertions', function() {
    assertionTypes(function(assert) {
        it('should throw an error when an undefined assertion property is accessed after a chainable property', function() {
            expectjs(function() {
                return assert([1,2,3]).to.include(1).and.to.be.an('array').toBeAnArrayOfSizeThree;
            }).to.throwError(/toBeAnArrayOfSizeThree/);
        });

        it('should throw an error when an undefined assertion property is accessed after a chainable method property', function() {
            expectjs(function() {
                assert('one, two, and three').to.contain.theTextTwo;
            }).to.throwError(/theTextTwo/);
        });

        it('should throw an error when an undefined assertion property is accessed after a method property', function() {
            expectjs(function() {
                assert(true).to.be.true.and.treu;
            }).to.throwError(/treu/);
        });

        it('should throw and error when an undefined assertion property is accessed after a method', function() {
            expectjs(function() {
                assert(true).to.equal(true).treu;
            }).to.throwError(/treu/);
        });

        it('should only throw exceptions when attributes are undefined, not falsy', function() {
            var assertion = assert(true).to.equal(true);
            assertion.bar = false;
            expectjs(function() {
                assertion.bar;
            }).to.not.throwError();

            assertion.bar = null;
            expectjs(function() {
                assertion.bar;
            }).to.not.throwError();

            assertion.bar = undefined;
            expectjs(function() {
                assertion.bar;
            }).to.throwError(/bar/);
        });

        it('should not proxy properties that are already proxies', function() {
            var stack = '';
            try {
                assert(q()).to.eventually.be.fulfilled.fooo;
            }
            catch (e) {
                stack = e.stack;
            }

            stack = _.filter(stack.split('\n'), function(line) {
                    return (/chaiMissingAssertion/.test(line));
                });

            expectjs(stack.length).to.equal(1);
        });

        it('should allow ignoring potentially undefined properties', function() {
            var missingProperty = 'potentially_missing';
            function missingPropertyTest() {
                assert(true).to[missingProperty];
            }

            expectjs(missingPropertyTest).to.throwError();
            chaiMissingAssertions.ignore(missingProperty);
            expectjs(missingPropertyTest).to.not.throwError();
            chaiMissingAssertions.unignore(missingProperty);
        });
    });
});

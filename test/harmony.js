'use strict';

var expectjs = require('expect.js'),
    assertionTypes = require('./utils/assertion-types'),
    availableProxies = require('../lib/available-proxies');

if (availableProxies.harmony) {
    describe('missing assertions - harmony only', function() {
        assertionTypes(function(assert) {
            it('should allow should to be used on chai.Assertion objects', function() {
                return assert(true).should.equal(true);
            });

            describe('proxyChainableGetterMethod', function() {
                it('the base assertion object should handle undefined', function() {
                    expectjs(function() {
                        return assert(true).foobar;
                    }).to.throwError(/foobar/);
                });

                it('a method accessed as a property should work', function() {
                    expectjs(function() {
                        return assert(true).an.foobar;
                    }).to.throwError(/foobar/);
                });

                it('a method accessed as a method should work', function() {
                    expectjs(function() {
                        return assert(true).an('boolean').foobar;
                    }).to.throwError(/foobar/);
                });
            });
        });
    });
}

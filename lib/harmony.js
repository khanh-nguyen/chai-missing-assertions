// See http://soft.vub.ac.be/~tvcutsem/proxies/ for a decent tutorial on Proxy
'use strict';

var _ = require('lodash'),
    ignoredProperties = require('./ignored-properties');

function harmonyMissingAssertions(chai) {
    var missingChaiAssertionProxy = require('harmony-proxy');

    chai.Assertion.prototype.__proto__ = missingChaiAssertions(chai.Assertion.prototype.__proto__);

    function missingChaiAssertions(target) {
        return missingChaiAssertionProxy(target, {
            get: function(r, trap, ctx) {
                // If we are using chai's should on ourselves, we should
                // short-circuit
                if (trap === 'should') {
                    return ctx;
                }

                // We only want to throw Reference errors when attempting to
                // access properties of an instance of the object (not the
                // prototype) as and only if those properties are not part of
                // the configurable ignore list.
                else if (
                    ctx instanceof chai.Assertion &&
                    !_.contains(ignoredProperties.list, trap)
                ) {
                    throw new ReferenceError(
                        'The property `' +
                        trap +
                        '` is not defined on this object'
                    );
                }
            }
        });
    }

    return true;
}

module.exports = harmonyMissingAssertions;

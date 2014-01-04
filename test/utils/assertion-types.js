'use strict';

var chai = require('chai'),
    _ = require('lodash'),
    assertionTypeMethods = {
        should: function(value) {
            return value.should;
        },
        expect: function(value) {
            return chai.expect(value);
        }
    };

function assertionTypes(testsFn) {
    _.each(assertionTypeMethods, function(assert, assertionType) {
        describe('with ' + assertionType + ' -', function() {
            testsFn(assert);
        });
    });
}

module.exports = assertionTypes;

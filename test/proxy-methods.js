'use strict';

var expectjs = require('expect.js'),
    chai = require('chai'),
    q = require('q'),
    _ = require('lodash'),
    assertionTypes = require('./utils/assertion-types');

describe('proxy functions', function() {
    it('should proxy the `set` method back to the proxied object', function() {
        var assertion = true.should.be;
        assertion.foo = 'bar';
        expectjs(assertion.foo).to.equal('bar');
    });

    it('should proxy the `has` method back to the proxied object', function() {
        var assertion = true.should.be;
        var properties = [];

        assertion.foo = 'bar';
        for (var name in assertion) {
            properties.push(name);
        }

        expectjs(properties.indexOf('foo')).to.be.above(-1);
    });

    it('should proxy the `enumerate` method to the proxied object', function() {
        var assertion = true.should.be;
        var properties = Object.keys(assertion);
        expectjs(properties.length).to.be.above(0);
    });

    it('should proxy the `delete` method to the proxied object', function() {
        var assertion = true.should.be;
        assertion.bar = 'baz';
        expectjs(assertion.bar).to.equal('baz');
        delete assertion.bar;
        expectjs(function() { assertion.bar; }).to.throwError(/bar/);
    });

    it('should skip proxying properties that are not configurable', function() {
        chai.use(function(_chai) {
            Object.defineProperty(chai.Assertion.prototype, 'no_overwrite', {
                get: function() {},
                configurable: false
            });
        });
    });
});

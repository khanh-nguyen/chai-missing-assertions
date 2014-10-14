// See http://soft.vub.ac.be/~tvcutsem/proxies/ for a decent tutorial on Proxy

'use strict';

var _ = require('lodash'),
    availableProxies = require('./available-proxies'),
    ignoredProperties = require('./ignored-properties');

function injectAssertionsProxy(chai) {
    var Proxy = require(availableProxies.nodeProxyPath),
        Assertion = chai.Assertion,
        propertyNames = Object.getOwnPropertyNames(Assertion.prototype),
        propertyDescriptors,
        methodNames,
        getterNames;

    propertyDescriptors = _(propertyNames)
        .map(function(name) {
            return [
                name,
                Object.getOwnPropertyDescriptor(Assertion.prototype, name)
            ];
        })
        .zipObject()
        .value();

    methodNames = propertyNames.filter(function(name) {
        return name !== 'assert' &&
            typeof propertyDescriptors[name].value === 'function';
    });

    getterNames = propertyNames.filter(function(name) {
        return name !== '_obj' &&
            typeof propertyDescriptors[name].get === 'function';
    });

    methodNames.forEach(proxyMethod);
    getterNames.forEach(proxyGetter);

    // Methods to handle proxying
    function wrapProperty(assertion, prop, name) {
        // We do not want to proxy things that are already proxied.
        if (prop && Proxy.isProxy(prop)) {
            return prop;
        }

        if (prop instanceof Assertion) {
            if (_.isFunction(prop)) {
                return proxyFunction(assertion, function() {
                    var result = prop.apply(assertion, arguments);
                    return wrapProperty(
                        assertion,
                        result,
                        name
                    );
                });
            }
            return proxyObject(assertion, prop);
        }
        return prop;
    }

    function createMissingChaiAssertion(obj) {

        var missingChaiAssertion = {
                target: obj
            },
            missingChaiAssertionProxy = _.merge;

        // We only alias this so that the Error.stack shows a stack trace with
        // a well named method `Object.chaiMissingAssertion.get` instead of
        // `Object._.merge.get`
        missingChaiAssertionProxy(missingChaiAssertion, {

            // This is the method we use to intecept and throw errors when a chai
            // assertion property is accessed that does not exist.
            get: function(receiver, name) {
                var value = missingChaiAssertion.target[name];

                // These properties should not be wrapped, or throw errors if they
                // are not present.
                if (_.contains(ignoredProperties.list, name)) {
                    return value;
                }

                if (value === undefined) {
                    throw new ReferenceError(
                        'The property `' +
                            name +
                            '` is not defined on this object'
                    );
                }

                return wrapProperty(missingChaiAssertion.target, value, name);
            },

            // These are all just normal accessors for an object that we do not
            // overload
            has: function(name) {
                return name in missingChaiAssertion.target;
            },
            set: function(receiver, name, val) {
                missingChaiAssertion.target[name] = val;
                return true;
            },
            delete: function(name) {
                return delete missingChaiAssertion.target[name];
            },
            enumerate: function() {
                var props = [],
                    name;
                for (name in missingChaiAssertion.target) {
                    props.push(name);
                }
                return props;
            }
        });

        return missingChaiAssertion;
    }

    function catchRedefine(methodName, func) {
        // If a property is not defined with `configurable: true` then we
        // should not throw an error, and just skip wrapping that method in
        // a proxy
        try {
            func();
        }
        catch (e) {
            if (!(e instanceof TypeError &&
                ('Cannot redefine property: ' + methodName) === e.message)
               ) {
                throw e;
            }
        }
    }

    function proxyMethod(methodName) {
        catchRedefine(methodName, function() {
            Assertion.overwriteMethod(methodName, function(originalMethod) {
                return function() {
                    var result = originalMethod.apply(this, arguments);
                    return wrapProperty(
                        this,
                        result,
                        methodName
                    );
                };
            });
        });
    }

    function proxyGetter(getterName) {
        var propertyDescriptor = propertyDescriptors[getterName],
            isChainableMethod = false;

        // Chainable methods are things like `an`, which can work both for
        // `.should.be.an.instanceOf` and as `should.be.an("object")`. We need
        // to handle those specially.
        try {
            isChainableMethod = typeof propertyDescriptor.get.call({}) === 'function';
        } catch (e) { }

        if (isChainableMethod) {
            proxyChainableGetterMethod(getterName, propertyDescriptor);
        } else {
            proxyGetterMethod(getterName);
        }
    }

    function proxyChainableGetterMethod(getterName, propertyDescriptor) {
        catchRedefine(getterName, function() {
            Assertion.addChainableMethod(
                getterName,
                function() {
                    var result = propertyDescriptor.get.call(this)
                        .apply(this, arguments);
                    return wrapProperty(
                        this,
                        result,
                        getterName
                    );
                },
                function() {
                    var result = propertyDescriptor.get.apply(this, arguments);
                    return wrapProperty(
                        this,
                        result,
                        getterName
                    );
                }
            );
        });
    }

    function proxyGetterMethod(getterName) {
        catchRedefine(getterName, function() {
            Assertion.overwriteProperty(getterName, function(originalGetter) {
                return function() {
                    var result = originalGetter.apply(this, arguments);
                    return wrapProperty(
                        this,
                        result,
                        getterName
                    );
                };
            });
        });
    }

    function proxyObject(context, obj) {
        return Proxy.create(
            createMissingChaiAssertion(context),
            obj
        );
    }

    function proxyFunction(context, func) {
        return Proxy.createFunction(
            createMissingChaiAssertion(context),
            func
        );
    }
}

function nodeProxyMissingAssertions(chai) {
    var chaiUse = chai.use;

    // Ensure we re-apply ourselves with future plugins are loaded.
    chai.use = function use() {
        var value = chaiUse.apply(chai, arguments);
        injectAssertionsProxy(chai);
        return value;
    };

    injectAssertionsProxy(chai);

    return true;
}

module.exports = nodeProxyMissingAssertions;

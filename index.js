// See http://soft.vub.ac.be/~tvcutsem/proxies/ for a decent tutorial on Proxy

'use strict';

var chalk = require('chalk'),
    ignoredProperties = require('./lib/ignored-properties'),
    availableProxies = require('./lib/available-proxies');

function chaiMissingAssertions(chai) {
    var injectAssertionsProxy;

    if (availableProxies.harmony) {
        injectAssertionsProxy = require('./lib/harmony');
        return injectAssertionsProxy(chai);
    }
    else if (availableProxies.nodeProxy) {
        injectAssertionsProxy = require('./lib/node-proxy');
        return injectAssertionsProxy(chai);
    }
    else {
        console.log(
            chalk.yellow('[warning] ') +
            chalk.grey('Unable to enable ') +
            chalk.magenta('chai-missing-assertions') + chalk.gray(' plugin.')
        );
        console.log(
            chalk.green('[info] ') +
            chalk.grey('To enable ') +
            chalk.magenta('chai-missing-assertions ') +
            chalk.grey('do one of the following:')
        );
        console.log(
            chalk.green('[info] ') +
            chalk.grey('* Run your program with ') +
            chalk.green('node --harmony-proxies ') +
            chalk.grey('to enable node\'s Proxy features.')
        );
        console.log(
            chalk.green('[info] ') +
            chalk.grey('* NPM install node-proxy ') +
            chalk.green('npm install --save-dev node-proxy ') +
            chalk.grey('to install an extension that emulates the node harmony proxies.')
        );
        return false;
    }
}

chaiMissingAssertions.ignore = ignoredProperties.add;
chaiMissingAssertions.unignore = ignoredProperties.remove;

// * __flags - used internally in chai (and it may not be // defined)
ignoredProperties.add('__flags');

// * negate - used internally in chai (and it may not be // defined)
ignoredProperties.add('negate');

// * inspect - used in the REPL and should not throw an error
ignoredProperties.add('inspect');

// * then - exposed in chai-as-promised and may or may not be present
// * promiseDispatch - exposed in chai-as-promised and may or may not be present
ignoredProperties.add('then');
ignoredProperties.add('promiseDispatch');

// * _obj - exposed in chai and should not be wrapped
ignoredProperties.add('_obj');

module.exports = chaiMissingAssertions;

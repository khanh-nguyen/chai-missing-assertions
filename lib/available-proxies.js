'use strict';

var path = require('path'),
    findup = require('findup'),
    nodeHarmonyAvailable = typeof(Proxy) !== 'undefined',
    nodeProxyPath,
    nodeProxyAvailable;

try {
    nodeProxyPath = findup.sync(
        path.resolve(__dirname),
        path.join('node_modules', 'node-proxy')
    );
    nodeProxyPath = path.join(nodeProxyPath, 'node_modules', 'node-proxy');
    require(nodeProxyPath);
    nodeProxyAvailable = true;
}
catch (e) {
    nodeProxyAvailable = false;
}

module.exports = {
    nodeProxyPath: nodeProxyPath,
    nodeProxy: nodeProxyAvailable,
    harmony: nodeHarmonyAvailable,
    any: nodeHarmonyAvailable || nodeProxyAvailable
};

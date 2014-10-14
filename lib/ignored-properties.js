'use strict';

var ignoredProperties = [];

function ignoreMissingAssertion(name) {
    ignoredProperties.push(name);
}

function unignoreMissingAssertion(name) {
    var index = ignoredProperties.indexOf(name);
    if (index !== -1) {
        delete ignoredProperties[index];
    }
}

module.exports = {
    add: ignoreMissingAssertion,
    remove: unignoreMissingAssertion,
    list: ignoredProperties
};

#!/bin/bash

TEST_OUTPUT='.test_output'
THIRD_PARTY_TESTS=414
NORMAL_OPERATIONS_TESTS=$(($(grep '\bit(' test/normal-operations.js | wc -l) * 2 - 1))
ANY_PROXY_TESTS=$(($(grep '\bit(' test/any-proxy.js | wc -l) * 2))
HARMONY_TESTS=$(($(grep '\bit(' test/harmony.js | wc -l) * 2))

echo "There are $ANY_PROXY_TESTS tests for any proxy"
echo "There are $HARMONY_TESTS tests for only the harmony proxy"
echo "There are $NORMAL_OPERATIONS_TESTS tests for normal operations"
echo "There are $THIRD_PARTY_TESTS 3rd party tests"
echo ""

TOTAL_NO_PLUGIN=$(($THIRD_PARTY_TESTS + $NORMAL_OPERATIONS_TESTS))
TOTAL_HARMONY=$(($TOTAL_NO_PLUGIN + $ANY_PROXY_TESTS + $HARMONY_TESTS))
TOTAL_NODE_PROXY=$(($TOTAL_NO_PLUGIN + $ANY_PROXY_TESTS))

function assertTestOutput {
    set +e

    grep "$1" $TEST_OUTPUT > /dev/null
    if [ $? -ne 0 ]; then
        echo "$2"
        exit 1
    fi

    set -e
}

# Clean up after ourselves
trap "rm -f $TEST_OUTPUT" EXIT

# Ensure that we exit on the first command that fails
set -e

# Lets get rid of node-proxy to test that we handle the absense of node-proxy
# and running node with --harmony properly
rm -Rf ./node_modules/node-proxy/

# Test that application alerts users to being able to support chai-missing-assertions
./node_modules/.bin/mocha test test/**/ | tee $TEST_OUTPUT

# Ensure that we received the correct warning on running the tests that our
# plugin is not enabled.
assertTestOutput "\[warning\] Unable to enable chai-missing-assertions plugin." "ERROR: Expected to see chai-missing-assertions warning on invalid environment"
assertTestOutput "$TOTAL_NO_PLUGIN passing" "ERROR: Expected $TOTAL_NO_PLUGIN no plugin loaded tests to have been run"

# Test that we work with node --harmony-proxies
./node_modules/.bin/mocha --harmony-proxies test test/**/ | tee $TEST_OUTPUT
# Ensure that all tests ran successfully.
assertTestOutput "$TOTAL_HARMONY passing" "ERROR: Expected $TOTAL_HARMONY harmony tests to have been run"

# Test that we work with node-proxy installed
npm install node-proxy;
./node_modules/.bin/mocha test test/**/ | tee $TEST_OUTPUT
assertTestOutput "$TOTAL_NODE_PROXY passing" "ERROR: Expected $TOTAL_NODE_PROXY node-proxy enabled tests to have been run"

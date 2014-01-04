chai-missing-assertions
=======================

Chai plug-in to throw errors when you attempt to use undefined assertions.

Chai is a wonderful assertion library, however, there is one fatal flaw with
the beautiful syntactic-sugar that they provide with Object property
assertions: If you misspell or use in incorrect one, it will act as if the
assertion was true.

```javascript
var chai = require('chai');
    expect = chai.expect,
    should = chai.should();

// Ahhhh, the beauty of property assertions. Such clean syntax.
expect(true).to.be.true;        // -> assertion correctly does not throw an error
expect(true).to.be.false;       // -> assertion correctly throws an error

// These assertion properties do not exist.
expect(true).to.be.truthful;    // -> assertion incorrectly does not throw an error
expect(true).to.be.treu;        // -> assertion incorrectly does not throw an error
expect(true).to.be.flase;       // -> assertion incorrectly does not throw an error
```

Chai really should throw an error if you access an undefined property of the
assertion chain. This library adds exactly that!

```javascript
var chai = require('chai');
    expect = chai.expect,
    should = chai.should();

chai.use(require('chai-missing-assertions'));

// Ahhhh, the beauty of property assertions. Such clean syntax.
expect(true).to.be.true;        // -> assertion correctly does not throw error
expect(true).to.be.false;       // -> assertion correctly throws error

// These assertion properties do not exist.
expect(true).to.be.truthful;    // -> assertion correctly throws an error
expect(true).to.be.treu;        // -> assertion correctly throws an error
expect(true).to.be.flase;       // -> assertion correctly throws an error
```

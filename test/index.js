'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { ValidateDirective } = require('../lib');
const { describe, it } = exports.lab = Lab.script();


describe('DynamoDBStreamEmitter', () => {
  it('initial test', () => {
    Assert(ValidateDirective);
  });
});

'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer, createServerWithListOpsOnNonList } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('Array', () => {
  it('can only be used on list types', () => {
    Assert.throws(() => {
      createServerWithListOpsOnNonList();
    }, /non-list 'integer' attempted list validation/);
  });

  it('arrayLength()', async () => {
    const server = createServer();
    const query = `
      query Validate($arrayLength: [String]) {
        listType(arrayLength: $arrayLength)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { arrayLength: ['one', 'two', 'three'] }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: { arrayLength: 'one' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'arrayLength',
        label: 'arrayLength',
        limit: 3,
        value: ['one']
      },
      message: '"arrayLength" must contain 3 items',
      path: ['arrayLength'],
      type: 'array.length'
    });
    Assert.strictEqual(result.data.listType, null);
  });
});

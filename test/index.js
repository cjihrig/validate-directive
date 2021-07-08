'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('GraphQL Compatibility', () => {
  it('handles non-nullable types', async () => {
    const server = createServer();
    const query = '{ nonNullable(foo: "foo-string") }';
    const result = await server.executeOperation({ query });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.nonNullable, true);
  });

  it('handles list types', async () => {
    const server = createServer();
    const query = '{ listType(foo: ["foo-string"]) }';
    const result = await server.executeOperation({ query });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);
  });
});

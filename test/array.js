'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer, createServerWithListOpsOnNonList } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('Array', () => {
  it('can only be used on list types', () => {
    Assert.throws(() => {
      createServerWithListOpsOnNonList();
    }, /'arrayLength' cannot be used to validate 'integer'/);
  });

  it('validates if a scalar is passed', async () => {
    const server = createServer();
    const query = `
      query Validate($foo: [String]) {
        listType(foo: $foo)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { foo: 'foo' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: { foo: 'FOO' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 0,
        label: 'foo[0]',
        value: 'FOO'
      },
      message: '"foo[0]" must only contain lowercase characters',
      path: ['foo', 0],
      type: 'string.lowercase'
    });
    Assert.strictEqual(result.data.listType, null);
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

  it('arrayMax()', async () => {
    const server = createServer();
    const query = `
      query Validate($arrayMax: [Int]) {
        listType(arrayMax: $arrayMax)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { arrayMax: [1, 2, 3] }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: { arrayMax: [1, 2, 3, 4] }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'arrayMax',
        label: 'arrayMax',
        limit: 3,
        value: [1, 2, 3, 4]
      },
      message: '"arrayMax" must contain less than or equal to 3 items',
      path: ['arrayMax'],
      type: 'array.max'
    });
    Assert.strictEqual(result.data.listType, null);
  });

  it('arrayMin()', async () => {
    const server = createServer();
    const query = `
      query Validate($arrayMin: [Int]) {
        listType(arrayMin: $arrayMin)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { arrayMin: [1] }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: { arrayMin: [] }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'arrayMin',
        label: 'arrayMin',
        limit: 1,
        value: []
      },
      message: '"arrayMin" must contain at least 1 items',
      path: ['arrayMin'],
      type: 'array.min'
    });
    Assert.strictEqual(result.data.listType, null);
  });

  it('sort()', async () => {
    const server = createServer();
    let query = `
      query Validate($sort: [TestInput]) {
        listType(sort: $sort)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { sort: [{ port: 80 }, { port: 4000 }, { port: 9000 }] }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: { sort: [{ port: 4000 }, { port: 80 }, { port: 9000 }] }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        by: 'port',
        key: 'sort',
        label: 'sort',
        order: 'ascending',
        value: [{ port: 4000 }, { port: 80 }, { port: 9000 }]
      },
      message: '"sort" must be sorted in ascending order by port',
      path: ['sort'],
      type: 'array.sort'
    });
    Assert.strictEqual(result.data.listType, null);

    query = `
      query Validate($sortDescending: [TestInput]) {
        listType(sortDescending: $sortDescending)
      }`;
    result = await server.executeOperation({
      query,
      variables: {
        sortDescending: [{ port: 9000 }, { port: 4000 }, { port: 80 }]
      }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);
  });

  it('unique()', async () => {
    const server = createServer();
    let query = `
      query Validate($uniqueBoolean: [Boolean]) {
        listType(uniqueBoolean: $uniqueBoolean)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { uniqueBoolean: [true, false] }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: { uniqueBoolean: [true, true] }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        dupePos: 0,
        dupeValue: true,
        key: 1,
        label: 'uniqueBoolean[1]',
        pos: 1,
        value: true
      },
      message: '"uniqueBoolean[1]" contains a duplicate value',
      path: ['uniqueBoolean', 1],
      type: 'array.unique'
    });
    Assert.strictEqual(result.data.listType, null);

    query = `
      query Validate($uniqueObject: [TestInput]) {
        listType(uniqueObject: $uniqueObject)
      }`;
    result = await server.executeOperation({
      query,
      variables: {
        uniqueObject: [
          { cat: { underHat: { ints: [4] } } },
          { cat: { underHat: { ints: [5] } } }
        ]
      }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.listType, true);

    result = await server.executeOperation({
      query,
      variables: {
        uniqueObject: [
          { cat: { underHat: { ints: [5] } } },
          { cat: { underHat: { ints: [5] } } }
        ]
      }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        dupePos: 0,
        dupeValue: { cat: { underHat: { ints: [5] } } },
        key: 1,
        label: 'uniqueObject[1]',
        path: 'cat.underHat.ints.0',
        pos: 1,
        value: { cat: { underHat: { ints: [5] } } }
      },
      message: '"uniqueObject[1]" contains a duplicate value',
      path: ['uniqueObject', 1],
      type: 'array.unique'
    });
    Assert.strictEqual(result.data.listType, null);
  });
});

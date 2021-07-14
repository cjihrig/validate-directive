'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('Object', () => {
  it('validates based on the input object', async () => {
    const server = createServer();
    const query = `
      query Validate($object: TestInput) {
        validate(object: $object)
      }`;
    let result = await server.executeOperation({
      query,
      variables: {
        object: {
          port: 3000
        }
      }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: {
        object: {
          port: 65536
        }
      }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'port',
        label: 'object.port',
        value: 65536
      },
      message: '"object.port" must be a valid port',
      path: ['object', 'port'],
      type: 'number.port'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('does not validate if the directive is omitted', async () => {
    const server = createServer();
    const query = `
      query Validate($objectNoValidation: TestInput) {
        validate(objectNoValidation: $objectNoValidation)
      }`;
    const result = await server.executeOperation({
      query,
      variables: {
        objectNoValidation: {
          port: 65536
        }
      }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);
  });

  it('validates nested objects', async () => {
    const server = createServer();
    const query = `
      query Validate($object: TestInput) {
        validate(object: $object)
      }`;
    let result = await server.executeOperation({
      query,
      variables: {
        object: {
          boolean: true,
          cat: {
            underHat: {
              underHat: [
                {
                  string: 'foo'
                }
              ],
              ints: [5, 4, 3]
            }
          }
        }
      }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: {
        object: {
          boolean: true,
          cat: {
            underHat: {
              underHat: [
                {
                  string: ['FOO']
                }
              ],
              ints: [5, 4, 3]
            }
          }
        }
      }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 0,
        label: 'object.cat.underHat.underHat[0].string[0]',
        value: 'FOO'
      },
      message: '"object.cat.underHat.underHat[0].string[0]" must only contain lowercase characters',
      path: ['object', 'cat', 'underHat', 'underHat', 0, 'string', 0],
      type: 'string.lowercase'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('objectLength()', async () => {
    const server = createServer();
    const query = `
      query Validate($objectLength: TestInput) {
        validate(objectLength: $objectLength)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { objectLength: { boolean: true, port: 8080 } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { objectLength: { cat: {} } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'objectLength',
        label: 'objectLength',
        limit: 2,
        value: { cat: {} }
      },
      message: '"objectLength" must have 2 keys',
      path: ['objectLength'],
      type: 'object.length'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('and()', async () => {
    const server = createServer();
    const query = `
      query Validate($and: TestInput) {
        validate(and: $and)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { and: { boolean: true, port: 8080 } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { and: { port: 22 } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'and',
        label: 'and',
        missing: ['boolean'],
        missingWithLabels: ['boolean'],
        present: ['port'],
        presentWithLabels: ['port'],
        value: { port: 22 }
      },
      message: '"and" contains [port] without its required peers [boolean]',
      path: ['and'],
      type: 'object.and'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('objectMax()', async () => {
    const server = createServer();
    const query = `
      query Validate($objectMax: TestInput) {
        validate(objectMax: $objectMax)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { objectMax: { boolean: true, port: 8080 } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { objectMax: { boolean: true, port: 8080, cat: {} } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'objectMax',
        label: 'objectMax',
        limit: 2,
        value: { boolean: true, port: 8080, cat: {} }
      },
      message: '"objectMax" must have less than or equal to 2 keys',
      path: ['objectMax'],
      type: 'object.max'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('objectMin()', async () => {
    const server = createServer();
    const query = `
      query Validate($objectMin: TestInput) {
        validate(objectMin: $objectMin)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { objectMin: { boolean: true, port: 8080 } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { objectMin: { boolean: true } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'objectMin',
        label: 'objectMin',
        limit: 2,
        value: { boolean: true }
      },
      message: '"objectMin" must have at least 2 keys',
      path: ['objectMin'],
      type: 'object.min'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('nand()', async () => {
    const server = createServer();
    const query = `
      query Validate($nand: TestInput) {
        validate(nand: $nand)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { nand: { boolean: true, cat: {} } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { nand: { boolean: false, port: 22 } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'nand',
        label: 'nand',
        main: 'boolean',
        mainWithLabel: 'boolean',
        peers: ['port'],
        peersWithLabels: ['port'],
        value: { boolean: false, port: 22 }
      },
      message: '"boolean" must not exist simultaneously with [port]',
      path: ['nand'],
      type: 'object.nand'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('or()', async () => {
    const server = createServer();
    const query = `
      query Validate($or: TestInput) {
        validate(or: $or)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { or: { boolean: true, port: 22 } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { or: { cat: {} } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'or',
        label: 'or',
        peers: ['boolean', 'port'],
        peersWithLabels: ['boolean', 'port'],
        value: { cat: {} }
      },
      message: '"or" must contain at least one of [boolean, port]',
      path: ['or'],
      type: 'object.missing'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('oxor()', async () => {
    const server = createServer();
    const query = `
      query Validate($oxor: TestInput) {
        validate(oxor: $oxor)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { oxor: { boolean: true } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { oxor: { boolean: true, port: 22 } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'oxor',
        label: 'oxor',
        peers: ['boolean', 'port'],
        peersWithLabels: ['boolean', 'port'],
        present: ['boolean', 'port'],
        presentWithLabels: ['boolean', 'port'],
        value: { boolean: true, port: 22 }
      },
      message: '"oxor" contains a conflict between optional exclusive peers [boolean, port]',
      path: ['oxor'],
      type: 'object.oxor'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('xor()', async () => {
    const server = createServer();
    const query = `
      query Validate($xor: TestInput) {
        validate(xor: $xor)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { xor: { boolean: true } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { xor: { boolean: true, port: 22 } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'xor',
        label: 'xor',
        peers: ['boolean', 'port'],
        peersWithLabels: ['boolean', 'port'],
        present: ['boolean', 'port'],
        presentWithLabels: ['boolean', 'port'],
        value: { boolean: true, port: 22 }
      },
      message: '"xor" contains a conflict between exclusive peers [boolean, port]',
      path: ['xor'],
      type: 'object.xor'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('with()', async () => {
    const server = createServer();
    const query = `
      query Validate($with: TestInput) {
        validate(with: $with)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { with: { boolean: true, port: 9999 } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { with: { boolean: true } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'with',
        label: 'with',
        main: 'boolean',
        mainWithLabel: 'boolean',
        peer: 'port',
        peerWithLabel: 'port',
        value: { boolean: true }
      },
      message: '"boolean" missing required peer "port"',
      path: ['with'],
      type: 'object.with'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('without()', async () => {
    const server = createServer();
    const query = `
      query Validate($without: TestInput) {
        validate(without: $without)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { without: { boolean: true } }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { without: { boolean: true, port: 9999 } }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'without',
        label: 'without',
        main: 'boolean',
        mainWithLabel: 'boolean',
        peer: 'port',
        peerWithLabel: 'port',
        value: { boolean: true, port: 9999 }
      },
      message: '"boolean" conflict with forbidden peer "port"',
      path: ['without'],
      type: 'object.without'
    });
    Assert.strictEqual(result.data.validate, null);
  });
});

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
});

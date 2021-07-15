'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer, createServerWithMissingDateCast } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('Date', () => {
  it('date validation cannot be used without a type cast', () => {
    Assert.throws(() => {
      createServerWithMissingDateCast();
    }, /'dateGreater' cannot be used to validate 'integerWithoutDateCast'/);
  });

  it('dateGreater()', async () => {
    const server = createServer();
    const query = `
      query Validate($dateGreater: String) {
        validate(dateGreater: $dateGreater)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { dateGreater: '1-2-1974' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { dateGreater: '12-31-1973' }
    });

    Assert.deepStrictEqual(
      result.errors[0].extensions.exception.details[0].type,
      'date.greater'
    );
    Assert.strictEqual(result.data.validate, null);
  });

  it('dateLess()', async () => {
    const server = createServer();
    const query = `
      query Validate($dateLess: String) {
        validate(dateLess: $dateLess)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { dateLess: '12-30-1973' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { dateLess: '1-1-1974' }
    });

    Assert.deepStrictEqual(
      result.errors[0].extensions.exception.details[0].type,
      'date.less'
    );
    Assert.strictEqual(result.data.validate, null);
  });

  it('dateMax()', async () => {
    const server = createServer();
    const query = `
      query Validate($dateMax: String) {
        validate(dateMax: $dateMax)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { dateMax: '12-30-1973' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { dateMax: '1-1-1974' }
    });

    Assert.deepStrictEqual(
      result.errors[0].extensions.exception.details[0].type,
      'date.max'
    );
    Assert.strictEqual(result.data.validate, null);
  });

  it('dateMin()', async () => {
    const server = createServer();
    const query = `
      query Validate($dateMin: String) {
        validate(dateMin: $dateMin)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { dateMin: '1-2-1974' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { dateMin: '12-31-1973' }
    });

    Assert.deepStrictEqual(
      result.errors[0].extensions.exception.details[0].type,
      'date.min'
    );
    Assert.strictEqual(result.data.validate, null);
  });

  it('iso()', async () => {
    const server = createServer();
    const query = `
      query Validate($iso: String) {
        validate(iso: $iso)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { iso: new Date('05 October 2011 14:48 UTC').toISOString() }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { iso: '10-05-2011' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        format: 'iso',
        key: 'iso',
        label: 'iso',
        value: '10-05-2011'
      },
      message: '"iso" must be in ISO 8601 date format',
      path: ['iso'],
      type: 'date.format'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('timestamp()', async () => {
    const server = createServer();
    const query = `
      query Validate($timestamp: Int) {
        validate(timestamp: $timestamp)
      }`;
    const result = await server.executeOperation({
      query,
      variables: { timestamp: Math.floor((new Date().getTime()) / 1000) }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);
  });
});

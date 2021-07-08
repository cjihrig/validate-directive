'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('Number', () => {
  it('greater()', async () => {
    const server = createServer();
    const query = `
      query Validate($greater: Float) {
        validate(greater: $greater)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { greater: 5.01 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { greater: 6 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { greater: 4.99 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'greater',
        label: 'greater',
        limit: 5,
        value: 4.99
      },
      message: '"greater" must be greater than 5',
      path: ['greater'],
      type: 'number.greater'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('integer()', async () => {
    const server = createServer();
    const query = `
      query Validate($integer: Float) {
        validate(integer: $integer)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { integer: 4.0 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { integer: 3.14 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'integer',
        label: 'integer',
        value: 3.14
      },
      message: '"integer" must be an integer',
      path: ['integer'],
      type: 'number.integer'
    });
    Assert.strictEqual(result.data.validate, null);

    result = await server.executeOperation({
      query: `
        query Validate($integer: Int) {
          validate(doubleInteger: $integer)
        }`,
      variables: { integer: 3 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);
  });

  it('less()', async () => {
    const server = createServer();
    const query = `
      query Validate($less: Float) {
        validate(less: $less)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { less: 9.999 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { less: 10.001 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'less',
        label: 'less',
        limit: 10,
        value: 10.001
      },
      message: '"less" must be less than 10',
      path: ['less'],
      type: 'number.less'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('max()', async () => {
    const server = createServer();
    const query = `
      query Validate($max: Float) {
        validate(max: $max)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { max: 2.9999 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { max: 3.0001 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'max',
        label: 'max',
        limit: 3,
        value: 3.0001
      },
      message: '"max" must be less than or equal to 3',
      path: ['max'],
      type: 'number.max'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('min()', async () => {
    const server = createServer();
    const query = `
      query Validate($min: Float) {
        validate(min: $min)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { min: -4.9999 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { min: -5.0001 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'min',
        label: 'min',
        limit: -5,
        value: -5.0001
      },
      message: '"min" must be greater than or equal to -5',
      path: ['min'],
      type: 'number.min'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('multiple()', async () => {
    const server = createServer();
    const query = `
      query Validate($multiple: Float) {
        validate(multiple: $multiple)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { multiple: 4 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { multiple: 5 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'multiple',
        label: 'multiple',
        multiple: 2,
        value: 5
      },
      message: '"multiple" must be a multiple of 2',
      path: ['multiple'],
      type: 'number.multiple'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('negative()', async () => {
    const server = createServer();
    const query = `
      query Validate($negative: Float) {
        validate(negative: $negative)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { negative: -1 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { negative: 1 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'negative',
        label: 'negative',
        value: 1
      },
      message: '"negative" must be a negative number',
      path: ['negative'],
      type: 'number.negative'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('port()', async () => {
    const server = createServer();
    const query = `
      query Validate($port: Float) {
        validate(port: $port)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { port: 80 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { port: -1 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'port',
        label: 'port',
        value: -1
      },
      message: '"port" must be a valid port',
      path: ['port'],
      type: 'number.port'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('positive()', async () => {
    const server = createServer();
    const query = `
      query Validate($positive: Float) {
        validate(positive: $positive)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { positive: 1 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { positive: -1 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'positive',
        label: 'positive',
        value: -1
      },
      message: '"positive" must be a positive number',
      path: ['positive'],
      type: 'number.positive'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('precision()', async () => {
    const server = createServer();
    const query = `
      query Validate($precision: Float) {
        validate(precision: $precision)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { precision: 3.14 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { precision: 3.142 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'precision',
        label: 'precision',
        limit: 2,
        value: 3.142
      },
      message: '"precision" must have no more than 2 decimal places',
      path: ['precision'],
      type: 'number.precision'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('sign()', async () => {
    const server = createServer();
    const query = `
      query Validate($sign: Float) {
        validate(sign: $sign)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { sign: -1 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { sign: 1 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'sign',
        label: 'sign',
        value: 1
      },
      message: '"sign" must be a negative number',
      path: ['sign'],
      type: 'number.negative'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('unsafe()', async () => {
    const server = createServer();
    const query = `
      query Validate($unsafeNotAllowed: Float) {
        validate(unsafeNotAllowed: $unsafeNotAllowed)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { unsafeNotAllowed: 5 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { unsafeNotAllowed: 90071992547409924 }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'unsafeNotAllowed',
        label: 'unsafeNotAllowed',
        value: 90071992547409924
      },
      message: '"unsafeNotAllowed" must be a safe number',
      path: ['unsafeNotAllowed'],
      type: 'number.unsafe'
    });
    Assert.strictEqual(result.data.validate, null);

    result = await server.executeOperation({
      query,
      variables: { unsafeAllowed: 90071992547409924 }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);
  });
});

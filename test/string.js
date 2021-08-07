'use strict';
const Assert = require('assert');
const Lab = require('@hapi/lab');
const { createServer } = require('./utils');
const { describe, it } = exports.lab = Lab.script();


describe('String', () => {
  it('alphanum()', async () => {
    const server = createServer();
    const query = `
      query Validate($alphanum: String) {
        validate(alphanum: $alphanum)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { alphanum: 'alphanumeric' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { alphanum: 'not alphanum' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'alphanum', label: 'alphanum', value: 'not alphanum' },
      message: '"alphanum" must only contain alpha-numeric characters',
      path: ['alphanum'],
      type: 'string.alphanum'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('base64()', async () => {
    const server = createServer();
    const query = `
      query Validate($base64: String) {
        validate(base64: $base64)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { base64: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { base64: 'not base64' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'base64', label: 'base64', value: 'not base64' },
      message: '"base64" must be a valid base64 string',
      path: ['base64'],
      type: 'string.base64'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('case()', async () => {
    const server = createServer();
    const query = `
      query Validate($case: String) {
        validate(case: $case)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { case: 'UPPERCASE' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { case: 'lowercase' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'case', label: 'case', value: 'lowercase' },
      message: '"case" must only contain uppercase characters',
      path: ['case'],
      type: 'string.uppercase'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('creditCard()', async () => {
    const server = createServer();
    const query = `
      query Validate($creditCard: String) {
        validate(creditCard: $creditCard)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { creditCard: '4111111111111111' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { creditCard: 'no' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'creditCard', label: 'creditCard', value: 'no' },
      message: '"creditCard" must be a credit card',
      path: ['creditCard'],
      type: 'string.creditCard'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('dataUri()', async () => {
    const server = createServer();
    const query = `
      query Validate($dataUri: String) {
        validate(dataUri: $dataUri)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { dataUri: 'data:image/png;base64,VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { dataUri: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'dataUri', label: 'dataUri', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"dataUri" must be a valid dataUri string',
      path: ['dataUri'],
      type: 'string.dataUri'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('domain()', async () => {
    const server = createServer();
    const query = `
      query Validate($domain: String) {
        validate(domain: $domain)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { domain: 'www.foo.com' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { domain: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'domain', label: 'domain', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"domain" must contain a valid domain name',
      path: ['domain'],
      type: 'string.domain'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('email()', async () => {
    const server = createServer();
    const query = `
      query Validate($email: String) {
        validate(email: $email)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { email: 'foo@bar.org' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { email: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        key: 'email',
        label: 'email',
        value: 'VE9PTUFOWVNFQ1JFVFM=',
        invalids: ['VE9PTUFOWVNFQ1JFVFM=']
      },
      message: '"email" must be a valid email',
      path: ['email'],
      type: 'string.email'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('guid()', async () => {
    const server = createServer();
    const query = `
      query Validate($guid: String) {
        validate(guid: $guid)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { guid: '123e4567-e89b-12d3-a456-426614174000' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { guid: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'guid', label: 'guid', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"guid" must be a valid GUID',
      path: ['guid'],
      type: 'string.guid'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('hex()', async () => {
    const server = createServer();
    const query = `
      query Validate($hex: String) {
        validate(hex: $hex)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { hex: 'AA' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { hex: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'hex', label: 'hex', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"hex" must only contain hexadecimal characters',
      path: ['hex'],
      type: 'string.hex'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('hostname()', async () => {
    const server = createServer();
    const query = `
      query Validate($hostname: String) {
        validate(hostname: $hostname)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { hostname: 'foo.bar' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { hostname: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'hostname', label: 'hostname', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"hostname" must be a valid hostname',
      path: ['hostname'],
      type: 'string.hostname'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('ip()', async () => {
    const server = createServer();
    const query = `
      query Validate($ip: String) {
        validate(ip: $ip)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { ip: '::1' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { ip: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        cidr: 'optional',
        key: 'ip',
        label: 'ip',
        value: 'VE9PTUFOWVNFQ1JFVFM=',
        version: ['ipv6']
      },
      message: '"ip" must be a valid ip address of one of the following versions [ipv6] with a optional CIDR',
      path: ['ip'],
      type: 'string.ipVersion'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('isoDate()', async () => {
    const server = createServer();
    const query = `
      query Validate($isoDate: String) {
        validate(isoDate: $isoDate)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { isoDate: '2018-11-28T18:25:32+00:00' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { isoDate: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'isoDate', label: 'isoDate', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"isoDate" must be in iso format',
      path: ['isoDate'],
      type: 'string.isoDate'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('isoDuration()', async () => {
    const server = createServer();
    const query = `
      query Validate($isoDuration: String) {
        validate(isoDuration: $isoDuration)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { isoDuration: 'P3Y6M4DT12H30M5S' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { isoDuration: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'isoDuration', label: 'isoDuration', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"isoDuration" must be a valid ISO 8601 duration',
      path: ['isoDuration'],
      type: 'string.isoDuration'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('length()', async () => {
    const server = createServer();
    const query = `
      query Validate($length: String) {
        validate(length: $length)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { length: 'four' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { length: 'seven' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        encoding: 'utf8',
        key: 'length',
        label: 'length',
        limit: 4,
        value: 'seven'
      },
      message: '"length" length must be 4 characters long',
      path: ['length'],
      type: 'string.length'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('lowercase()', async () => {
    const server = createServer();
    const query = `
      query Validate($lowercase: String) {
        validate(lowercase: $lowercase)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { lowercase: 'foo' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { lowercase: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'lowercase', label: 'lowercase', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"lowercase" must only contain lowercase characters',
      path: ['lowercase'],
      type: 'string.lowercase'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('maxLength()', async () => {
    const server = createServer();
    const query = `
      query Validate($maxLength: String) {
        validate(maxLength: $maxLength)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { maxLength: 'two' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { maxLength: 'seven' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        encoding: 'utf8',
        key: 'maxLength',
        label: 'maxLength',
        limit: 3,
        value: 'seven'
      },
      message: '"maxLength" length must be less than or equal to 3 characters long',
      path: ['maxLength'],
      type: 'string.max'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('minLength()', async () => {
    const server = createServer();
    const query = `
      query Validate($minLength: String) {
        validate(minLength: $minLength)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { minLength: 'four' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { minLength: 'one' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: {
        encoding: 'utf8',
        key: 'minLength',
        label: 'minLength',
        limit: 4,
        value: 'one'
      },
      message: '"minLength" length must be at least 4 characters long',
      path: ['minLength'],
      type: 'string.min'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('normalize()', async () => {
    const server = createServer();
    const query = `
      query Validate($normalize: String) {
        validate(normalize: $normalize)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { normalize: '\u03D3 \u00C5' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { normalize: '\u03D3 \u212B' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { form: 'NFC', key: 'normalize', label: 'normalize', value: 'ϓ Å' },
      message: '"normalize" must be unicode normalized in the NFC form',
      path: ['normalize'],
      type: 'string.normalize'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('pattern()', async () => {
    const server = createServer();
    const query = `
      query Validate($pattern: String) {
        validate(pattern: $pattern)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { pattern: 'abCcccCCC' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { pattern: 'ab' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'pattern', label: 'pattern', name: 'xyz', regex: /^abc+$/i, value: 'ab' },
      message: '"pattern" with value "ab" fails to match the xyz pattern',
      path: ['pattern'],
      type: 'string.pattern.name'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('regex()', async () => {
    const server = createServer();
    const query = `
      query Validate($regex: String) {
        validate(regex: $regex)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { regex: 'ab' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { regex: 'abc' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'regex', label: 'regex', name: undefined, regex: /^abc+$/, value: 'abc' },
      message: '"regex" with value "abc" matches the inverted pattern: /^abc+$/',
      path: ['regex'],
      type: 'string.pattern.invert.base'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('token()', async () => {
    const server = createServer();
    const query = `
      query Validate($token: String) {
        validate(token: $token)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { token: 'myToken123' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { token: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'token', label: 'token', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"token" must only contain alpha-numeric and underscore characters',
      path: ['token'],
      type: 'string.token'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('trim()', async () => {
    const server = createServer();
    const query = `
      query Validate($trim: String) {
        validate(trim: $trim)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { trim: 'trimmed' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { trim: ' not trimmed ' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'trim', label: 'trim', value: ' not trimmed ' },
      message: '"trim" must not have leading or trailing whitespace',
      path: ['trim'],
      type: 'string.trim'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('trim() updates the string if convert is true', async () => {
    const server = createServer();
    const query = `
      query Validate($trim: String!) {
        echoString(trim: $trim)
      }`;
    const result = await server.executeOperation({
      query,
      variables: {
        trim: '    a non-trimmed string     '
      }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.echoString, 'a non-trimmed string');
  });

  it('uppercase()', async () => {
    const server = createServer();
    const query = `
      query Validate($uppercase: String) {
        validate(uppercase: $uppercase)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { uppercase: 'FOO' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { uppercase: 'foo' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'uppercase', label: 'uppercase', value: 'foo' },
      message: '"uppercase" must only contain uppercase characters',
      path: ['uppercase'],
      type: 'string.uppercase'
    });
    Assert.strictEqual(result.data.validate, null);
  });

  it('uuid()', async () => {
    const server = createServer();
    const query = `
      query Validate($uuid: String) {
        validate(uuid: $uuid)
      }`;
    let result = await server.executeOperation({
      query,
      variables: { uuid: '35cb9c83:c6e7:4772:81e9:e86fe0fb5219' }
    });

    Assert.strictEqual(result.errors, undefined);
    Assert.strictEqual(result.data.validate, true);

    result = await server.executeOperation({
      query,
      variables: { uuid: 'VE9PTUFOWVNFQ1JFVFM=' }
    });

    Assert.deepStrictEqual(result.errors[0].extensions.exception.details[0], {
      context: { key: 'uuid', label: 'uuid', value: 'VE9PTUFOWVNFQ1JFVFM=' },
      message: '"uuid" must be a valid GUID',
      path: ['uuid'],
      type: 'string.guid'
    });
    Assert.strictEqual(result.data.validate, null);
  });
});

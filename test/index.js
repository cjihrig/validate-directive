'use strict';
const Assert = require('assert');
const { ApolloServer, gql } = require('apollo-server');
const Lab = require('@hapi/lab');
const { ValidateDirective } = require('../lib');
const { describe, it } = exports.lab = Lab.script();


describe('ValidateDirective', () => {
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
  });

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
});


function createServer () {
  const typeDefs = gql`
    ${ValidateDirective.sdl}

    type Query {
      validate (
        alphanum: String @validate(alphanum: TRUE)
        base64: String @validate(base64: { paddingRequired: false })
        case: String @validate(case: UPPER)
      ): Boolean
      nonNullable (
        foo: String! @validate(case: LOWER)
      ): Boolean
      listType (
        foo: [String!]! @validate(case: LOWER)
      ): Boolean
    }
  `;
  const resolvers = {
    Query: {
      validate (parent, args, context, info) {
        return true;
      },
      nonNullable (parent, args, context, info) {
        return true;
      },
      listType (parent, args, context, info) {
        return true;
      }
    }
  };

  return new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
      validate: ValidateDirective
    }
  });
}

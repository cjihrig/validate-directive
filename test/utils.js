'use strict';
const { ApolloServer, gql } = require('apollo-server');
const { ValidateDirective } = require('../lib');


function createServer () {
  const typeDefs = gql`
    ${ValidateDirective.sdl}

    enum TestEnum { A B C }

    input LittleCatC {
      foo: TestEnum @validate(case: UPPER, length: { limit: 1 })
      string: String @validate(case: LOWER)
    }

    input LittleCatA {
      underHat: LittleCatB @validate
    }

    input TestInput {
      boolean: Boolean
      port: Int @validate(port: TRUE)
      cat: LittleCatA @validate
    }

    type Query {
      validate (
        # Boolean validation - useless, just making sure it works.
        boolean: Boolean @validate

        # Date validation.
        dateGreater: String @validate(type: DATE, dateGreater: "1-1-1974")
        dateLess: String @validate(type: DATE, dateLess: "12-31-1973")
        dateMax: String @validate(type: DATE, dateMax: "12-31-1973")
        dateMin: String @validate(type: DATE, dateMin: "1-1-1974")
        iso: String @validate(type: DATE, iso: TRUE)
        timestamp: Int @validate(type: DATE, timestamp: UNIX)

        # Number validation.
        greater: Float @validate(greater: 5)
        integer: Float @validate(integer: TRUE)
        less: Float @validate(less: 10)
        max: Float @validate(max: 3)
        min: Float @validate(min: -5)
        multiple: Float @validate(multiple: 2)
        negative: Float @validate(negative: TRUE)
        port: Float @validate(port: TRUE)
        positive: Float @validate(positive: TRUE)
        precision: Float @validate(precision: 2)
        sign: Float @validate(sign: NEGATIVE)
        unsafeAllowed: Float @validate(unsafe: true)
        unsafeNotAllowed: Float @validate(unsafe: false)
        doubleInteger: Int @validate(integer: TRUE)

        # String validation.
        alphanum: String @validate(alphanum: TRUE)
        base64: String @validate(base64: { paddingRequired: false })
        case: String @validate(case: UPPER)
        length: String @validate(length: { limit: 4, encoding: "utf8" })
        maxLength: String @validate(maxLength: { limit: 3, encoding: "utf8" })
        minLength: String @validate(minLength: { limit: 4, encoding: "utf8" })

        # Object validation.
        object: TestInput @validate
        objectNoValidation: TestInput
      ): Boolean
      nonNullable (
        foo: String! @validate(case: LOWER)
      ): Boolean
      listType (
        foo: [String] @validate(case: LOWER)
        arrayLength: [String] @validate(case: LOWER, arrayLength: 3)
      ): Boolean
      enumType (
        foo: TestEnum @validate(
          alphanum: TRUE, case: UPPER, length: { limit: 1 }
        )
      ): Boolean
      typeConversion (
        stringToDate: String @validate(type: DATE)
        integerToDate: Int @validate(type: DATE)
      ): Boolean
    }

    type Mutation {
      validate (
        port: Int @validate(port: TRUE)
      ): Int
    }

    input LittleCatB {
      underHat: [LittleCatC]
      ints: [Int]
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
      },
      enumType (parent, args, context, info) {
        return true;
      },
      typeConversion (parent, args, context, info) {
        return true;
      }
    },
    Mutation: {
      validate (parent, args, context, info) {
        return 5;
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


function createServerWithListOpsOnNonList () {
  const typeDefs = gql`
    ${ValidateDirective.sdl}

    type Query {
      validate (
        integer: Float @validate(arrayLength: 3)
      ): Boolean
    }
  `;
  const resolvers = {
    Query: {
      validate (parent, args, context, info) {
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


module.exports = { createServer, createServerWithListOpsOnNonList };

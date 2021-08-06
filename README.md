# validate-directive

[![Current Version](https://img.shields.io/npm/v/validate-directive.svg)](https://www.npmjs.org/package/validate-directive)
![Dependencies](http://img.shields.io/david/cjihrig/validate-directive.svg)
[![belly-button-style](https://img.shields.io/badge/eslint-bellybutton-4B32C3.svg)](https://github.com/cjihrig/belly-button)

A GraphQL directive for input validation. View the complete directive as GraphQL SDL [here](https://github.com/cjihrig/validate-directive/blob/main/lib/schema.js).

## Description

GraphQL's type system provides a degree of input validation by default. However, it does not provide more fine grained validation out of the box. `validate-directive` provides dozens of battle-tested validation functions via a `@validate` directive.

`@validate` is a wrapper for the [`joi`](https://www.npmjs.com/package/joi) validation module. The `@validate` directive exposes the joi API where it makes sense. For example, joi provides validation for functions, symbols, and many other things that don't make sense in the context of a GraphQL directive.

Some joi API names are duplicated across data types. For example, in joi, `min()` and `max()` validators exist for arrays, dates, numbers, objects, etc. `@validate` exposes these with unique names such as `arrayMax`, `dateMax`, etc.

For questions regarding how specific joi validation functions work, see the [joi documentation](https://joi.dev/).

## Features

- Input validation for GraphQL primitives, enums, lists, and input objects.
- Validation provided on input objects is inherited, and can be overridden in other locations within the schema. This allows validation to be centralized with the input type and reused.
- The name of the directive and related input types is configurable.

## Usage

```graphql
enum TestEnum { A B C }

# Input objects can have schemas.
input TestInput {
  even: Int @validate(multiple: 2)

  nestedObject: [NestedTestInput!]! @validate(arrayLength: 3)
}

input NestedTestInput {
  # Enums are validated as strings.
  nestedEnum: TestEnum @validate(case: UPPER, length: { limit: 1 })
}

type Query {
  queries (
    # Boolean validation - does nothing.
    someBoolean: Boolean @validate

    # Strings and integers can be converted to dates and validated.
    dateAsString: String @validate(type: DATE, dateGreater: "1-1-1974")
    dateAsInteger: Int @validate(type: DATE, dateLess: "12-31-1973")
    isoDateString: String @validate(type: DATE, iso: TRUE)
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
    objectMaxSize: TestInput @validate(objectMax: 20)
    andRelationship: TestInput @validate(and: ["even", "nestedObject"])
    nand: TestInput @validate(nand: ["even", "nestedObject"])
    or: TestInput @validate(or: ["even", "nestedObject"])
    with: TestInput @validate(with: { key: "nestedObject", peers: ["even"] })
    without: TestInput @validate(
      without: { key: "nestedObject", peers: ["even"] }
    )
    oxor: TestInput @validate(oxor: ["even", "nestedObject"])
    xor: TestInput @validate(xor: ["even", "nestedObject"])

    # List validation.
    arrayLength: [String] @validate(case: LOWER, arrayLength: 3)
    arrayMax: [Int] @validate(arrayMax: 3)
    arrayMin: [Int] @validate(arrayMin: 1)
    sort: [TestInput] @validate(sort: { by: "even" })
    sortDescending: [TestInput] @validate(
      sort: { order: DESCENDING, by: "nestedObject.nestedEnum" }
    )
    uniqueBoolean: [Boolean] @validate(unique: {})
    uniqueObject: [TestInput] @validate(
      unique: { comparator: "nestedObject.nestedEnum" }
    )
  ): Boolean
}

type Mutation {
  validate (
    port: Int @validate(port: TRUE)
  ): Int
}
```

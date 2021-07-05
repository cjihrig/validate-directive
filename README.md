# validate-directive

[![Current Version](https://img.shields.io/npm/v/validate-directive.svg)](https://www.npmjs.org/package/validate-directive)
[![Build Status via Travis CI](https://travis-ci.org/cjihrig/validate-directive.svg?branch=master)](https://travis-ci.org/cjihrig/validate-directive)
![Dependencies](http://img.shields.io/david/cjihrig/validate-directive.svg)
[![belly-button-style](https://img.shields.io/badge/eslint-bellybutton-4B32C3.svg)](https://github.com/cjihrig/belly-button)

A GraphQL directive for input validation.

## Usage

```graphql
type Query {
  foo (
    bar: String! @validate(alphanum: TRUE, case: UPPER)
    baz: [String] @validate(base64: { paddingRequired: false })
  ): Boolean
}
```

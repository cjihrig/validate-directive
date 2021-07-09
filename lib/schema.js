'use strict';
const directiveSchema = `

directive @validate(
  # Array validation.
  arrayLength: Int

  # Number validation.
  greater: Float
  integer: ValidateFlag
  less: Float
  max: Float
  min: Float
  multiple: Float
  negative: ValidateFlag
  port: ValidateFlag
  positive: ValidateFlag
  precision: Int
  sign: ValidateSign
  unsafe: Boolean

  # String validation.
  alphanum: ValidateFlag
  base64: ValidateBase64Input
  case: ValidateCaseDirection
  creditCard: ValidateFlag
  dataUri: ValidateDataUriInput
  domain: ValidateDomainInput
  email: ValidateEmailInput
  length: ValidateStringLengthInput
  maxLength: ValidateStringLengthInput
  minLength: ValidateStringLengthInput
) on ARGUMENT_DEFINITION

enum ValidateFlag { TRUE }
enum ValidateCaseDirection { UPPER LOWER }
enum ValidateSign { NEGATIVE POSITIVE }

input ValidateBase64Input {
  paddingRequired: Boolean
  urlSafe: Boolean
}

input ValidateDataUriInput {
  paddingRequired: Boolean
}

input ValidateDomainInput {
  allowUnicode: Boolean
  minDomainSegments: Int
  maxDomainSegments: Int
  # TODO(cjihrig): Support tlds option.
}

input ValidateEmailInput {
  allowUnicode: Boolean
  ignoreLength: Boolean
  minDomainSegments: Int
  maxDomainSegments: Int
  multiple: Boolean
  separator: String
  # TODO(cjihrig): Support tlds option.
}

input ValidateStringLengthInput {
  limit: Int!
  encoding: String
}
`;

module.exports = { directiveSchema };

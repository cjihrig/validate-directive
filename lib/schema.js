'use strict';
const directiveSchema = `

directive @validate(
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

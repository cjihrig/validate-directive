'use strict';

function createSchema (directiveName) {
  const capitalizedName =
    directiveName.charAt(0).toUpperCase() + directiveName.slice(1);

  return `directive @${directiveName}(
    # Array validation.
    arrayLength: Int
    arrayMax: Int
    arrayMin: Int
    sort: ${capitalizedName}SortInput
    unique: ${capitalizedName}UniqueInput

    # Date validation.
    dateGreater: String
    iso: ${capitalizedName}Flag
    dateLess: String
    dateMax: String
    dateMin: String
    timestamp: ${capitalizedName}TimestampType

    # Number validation.
    greater: Float
    integer: ${capitalizedName}Flag
    less: Float
    max: Float
    min: Float
    multiple: Float
    negative: ${capitalizedName}Flag
    port: ${capitalizedName}Flag
    positive: ${capitalizedName}Flag
    precision: Int
    sign: ${capitalizedName}Sign
    unsafe: Boolean

    # Object validation.
    and: [String]
    objectLength: Int
    objectMax: Int
    objectMin: Int
    nand: [String]
    or: [String]
    oxor: [String]
    xor: [String]
    with: ${capitalizedName}WithInput
    without: ${capitalizedName}WithInput

    # String validation.
    alphanum: ${capitalizedName}Flag
    base64: ${capitalizedName}Base64Input
    case: ${capitalizedName}CaseDirection
    creditCard: ${capitalizedName}Flag
    dataUri: ${capitalizedName}DataUriInput
    domain: ${capitalizedName}DomainInput
    email: ${capitalizedName}EmailInput
    guid: ${capitalizedName}GuidInput
    hex: Boolean
    hostname: ${capitalizedName}Flag
    ip: ${capitalizedName}IpInput
    isoDate: ${capitalizedName}Flag
    isoDuration: ${capitalizedName}Flag
    length: ${capitalizedName}StringLengthInput
    lowercase: ${capitalizedName}Flag
    maxLength: ${capitalizedName}StringLengthInput
    minLength: ${capitalizedName}StringLengthInput
    normalize: ${capitalizedName}NormalizeForm
    pattern: ${capitalizedName}PatternInput
    regex: ${capitalizedName}PatternInput
    token: ${capitalizedName}Flag
    trim: Boolean
    uppercase: ${capitalizedName}Flag
    uuid: ${capitalizedName}GuidInput

    # Helpers.
    arrayPrefs: ${capitalizedName}Prefs
    prefs: ${capitalizedName}Prefs
    type: ${capitalizedName}Types
  ) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION | INPUT_OBJECT

  enum ${capitalizedName}Flag { TRUE }
  enum ${capitalizedName}CaseDirection { UPPER LOWER }
  enum ${capitalizedName}GuidSeparator { NONE COLON DASH COLON_OR_DASH }
  enum ${capitalizedName}GuidVersion { UUIDV1 UUIDV2 UUIDV3 UUIDV4 UUIDV5 }
  enum ${capitalizedName}IpVersion { IPV4 IPV6 IPVFUTURE }
  enum ${capitalizedName}IpCidr { OPTIONAL REQUIRED FORBIDDEN }
  enum ${capitalizedName}NormalizeForm { NFC NFD NFKC NFKD }
  enum ${capitalizedName}Sign { NEGATIVE POSITIVE }
  enum ${capitalizedName}SortOrder { ASCENDING DESCENDING }
  enum ${capitalizedName}TimestampType { UNIX JAVASCRIPT }
  enum ${capitalizedName}Types { DATE }

  input ${capitalizedName}Base64Input {
    paddingRequired: Boolean
    urlSafe: Boolean
  }

  input ${capitalizedName}DataUriInput {
    paddingRequired: Boolean
  }

  input ${capitalizedName}DomainInput {
    allowUnicode: Boolean
    minDomainSegments: Int
    maxDomainSegments: Int
    # TODO(cjihrig): Support tlds option.
  }

  input ${capitalizedName}EmailInput {
    allowUnicode: Boolean
    ignoreLength: Boolean
    minDomainSegments: Int
    maxDomainSegments: Int
    multiple: Boolean
    separator: String
    # TODO(cjihrig): Support tlds option.
  }

  input ${capitalizedName}GuidInput {
    version: [${capitalizedName}GuidVersion]
    separator: ${capitalizedName}GuidSeparator
  }

  input ${capitalizedName}IpInput {
    version: [${capitalizedName}IpVersion]
    cidr: ${capitalizedName}IpCidr
  }

  input ${capitalizedName}PatternInput {
    pattern: String
    flags: String
    name: String
    invert: Boolean
  }

  input ${capitalizedName}Prefs {
    convert: Boolean
  }

  input ${capitalizedName}SortInput {
    order: ${capitalizedName}SortOrder
    by: String
  }

  input ${capitalizedName}StringLengthInput {
    limit: Int!
    encoding: String
  }

  input ${capitalizedName}UniqueInput {
    comparator: String
  }

  input ${capitalizedName}WithInput {
    key: String!
    peers: [String]!
  }

  input ${capitalizedName}WithoutInput {
    key: String!
    peers: [String]!
  }
  `;
}

module.exports = { createSchema };

'use strict';
const { defaultFieldResolver } = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
const Joi = require('joi');
const kArgsSchema = Symbol('schema');

const joiMethodMapper = new Map([
  ['case', { argumentMapper (arg) { return arg.toLowerCase(); } }]
]);


class ValidateDirective extends SchemaDirectiveVisitor {
  static sdl = `
    directive @validate(
      alphanum: ValidateFlag
      base64: ValidateBase64Input
      case: ValidateCaseDirection
      creditCard: ValidateFlag
      dataUri: ValidateDataUriInput
      domain: ValidateDomainInput
      email: ValidateEmailInput
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

  `;

  visitArgumentDefinition (argument, { field }) {
    wrapResolver(field);

    const { name, astNode } = this.visitedType;
    const directive = astNode.directives.find((dir) => {
      return dir.name.value === this.name;
    });
    const schema = field.resolve[kArgsSchema];

    mapDirectiveToJoiSchema(name, astNode.type, schema, directive);
  }
}


function mapDirectiveToJoiSchema (fieldName, type, schema, directive) {
  let isListType = false;

  while (type.kind === 'ListType' || type.kind === 'NonNullType') {
    if (type.kind === 'ListType') {
      isListType = true;
    }

    type = type.type;
  }

  const joiType = mapGqlToJoiType(type);

  schema[fieldName] = joiType;

  for (const directiveArgument of directive.arguments) {
    const argName = directiveArgument.name.value;
    const argValue = parseGqlValue(directiveArgument.value);
    const mapper = joiMethodMapper.get(argName);
    const joiMethod = argName;
    let joiArgs = [argValue];

    if (mapper !== undefined) {
      const { argumentMapper } = mapper;

      if (typeof argumentMapper === 'function') {
        joiArgs = argumentMapper(argValue);
      }
    }

    if (!Array.isArray(joiArgs)) {
      joiArgs = [joiArgs];
    }

    schema[fieldName] = schema[fieldName][joiMethod](...joiArgs);
  }

  if (isListType) {
    schema[fieldName] = Joi.array().items(schema[fieldName]);
  }
}


function parseGqlValue (gqlValue) {
  switch (gqlValue.kind) {
    case 'IntValue' :
    case 'FloatValue' :
      return Number(gqlValue.value);
    case 'ObjectValue' :
      const obj = {};

      for (const field of gqlValue.fields) {
        obj[field.name.value] = parseGqlValue(field.value);
      }

      return obj;
    default :
      return gqlValue.value;
  }
}


function wrapResolver (field) {
  const { resolve = defaultFieldResolver } = field;

  // Wrap the existing resolver and mark it with a symbol.
  if (resolve[kArgsSchema] === undefined) {
    const resolver = async function (...resolverArgs) {
      // Handle input validation.
      const args = resolverArgs[1];
      const schema = Joi.object(resolver[kArgsSchema]);

      Joi.attempt(args, schema, {
        allowUnknown: true,
        convert: false
      });

      // Invoke the original resolver.
      // eslint-disable-next-line no-return-await
      return await resolve.apply(this, resolverArgs);
    };

    resolver[kArgsSchema] = {};
    field.resolve = resolver;
  }
}


function mapGqlToJoiType (gqlType) {
  const typeName = gqlType.name.value;

  switch (typeName) {
    case 'String' :
    case 'ID' :
      return Joi.string();
    case 'Boolean' :
      return Joi.boolean();
    case 'Int' :
      return Joi.number().integer();
    case 'Float' :
      return Joi.number();
    default :
      throw new Error(`type '${typeName}' is unsupported`);
  }
}

module.exports = { ValidateDirective };
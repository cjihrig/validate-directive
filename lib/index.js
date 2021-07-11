'use strict';
const Assert = require('assert');
const {
  defaultFieldResolver,
  getNamedType,
  isEnumType,
  isListType
} = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
const Joi = require('joi');
const { directiveSchema } = require('./schema');
const kArgsSchema = Symbol('schema');

const joiMethodMapper = new Map([
  // Array validation.
  ['arrayLength', {
    isArrayType: true,
    name: 'length'
  }],

  // Date validation.
  ['dateGreater', { name: 'greater' }],
  ['dateLess', { name: 'less' }],
  ['dateMax', { name: 'max' }],
  ['dateMin', { name: 'min' }],
  ['timestamp', { argumentMapper: argToLowercase }],

  // Number validation.
  ['sign', { argumentMapper: argToLowercase }],

  // String validation.
  ['case', { argumentMapper: argToLowercase }],
  ['length', { argumentMapper (arg) { return [arg.limit, arg.encoding]; } }],
  ['maxLength', {
    name: 'max',
    argumentMapper (arg) { return [arg.limit, arg.encoding]; }
  }],
  ['minLength', {
    name: 'min',
    argumentMapper (arg) { return [arg.limit, arg.encoding]; }
  }],

  // Helpers.
  ['type', {
    typeCast (arg) {
      const prefs = { convert: true };

      switch (arg) {
        case 'DATE' :
          return Joi.date().prefs(prefs);
        default :
          // $lab:coverage:off$
          throw new Error(`unrecognized type cast '${arg}'`);
          // $lab:coverage:on$
      }
    }
  }]
]);


class ValidateDirective extends SchemaDirectiveVisitor {
  visitArgumentDefinition (argument, { field }) {
    const { name, astNode } = this.visitedType;
    const directive = findDirective(astNode, this.name);

    wrapResolver(field);
    const joiSchema = field.resolve[kArgsSchema];

    mapDirectiveToJoiSchema(name, argument.type, joiSchema, directive);
  }
}

// TODO(cjihrig): Make static on the class.
ValidateDirective.sdl = directiveSchema;


function mapDirectiveToJoiSchema (fieldName, gqlType, joiSchema, directive) {
  const namedType = getNamedType(gqlType);
  const joiType = mapGqlToJoiType(namedType);
  const listValidation = [];

  joiSchema[fieldName] = joiType;

  for (let i = 0; i < directive.arguments.length; ++i) {
    const directiveArgument = directive.arguments[i];
    const argName = directiveArgument.name.value;
    const argValue = parseGqlValue(directiveArgument.value);
    const mapper = joiMethodMapper.get(argName);
    let joiMethod = argName;
    let joiArgs = [argValue];

    if (mapper !== undefined) {
      const { name, argumentMapper, isArrayType, typeCast } = mapper;

      if (typeof typeCast === 'function') {
        Assert(
          i === 0,
          new Error(`type cast '${argValue}' must be first directive argument`)
        );

        joiSchema[fieldName] = typeCast(argValue);
        continue;
      }

      if (typeof name === 'string') {
        joiMethod = name;
      }

      if (typeof argumentMapper === 'function') {
        joiArgs = argumentMapper(argValue);

        if (!Array.isArray(joiArgs)) {
          joiArgs = [joiArgs];
        }
      }

      if (isArrayType) {
        listValidation.push([joiMethod, joiArgs]);
        continue;
      }
    }

    joiSchema[fieldName] = joiSchema[fieldName][joiMethod](...joiArgs);
  }

  if (isListType(gqlType)) {
    joiSchema[fieldName] = Joi.array().items(joiSchema[fieldName]);

    for (const [joiMethod, joiArgs] of listValidation) {
      joiSchema[fieldName] = joiSchema[fieldName][joiMethod](...joiArgs);
    }
  } else if (listValidation.length > 0) {
    throw new Error(`non-list '${fieldName}' attempted list validation`);
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


function mapGqlToJoiType (schemaType) {
  const typeName = schemaType.name;

  switch (typeName) {
    case 'String' :
    case 'ID' :
      return Joi.string();
    case 'Int' :
      return Joi.number().integer();
    case 'Float' :
      return Joi.number();
    case 'Boolean' :
      return Joi.boolean();
    default :
      // $lab:coverage:off$
      if (isEnumType(schemaType)) {
      // $lab:coverage:on$
        return mapEnumToJoiType(schemaType);
      }

      // Unhandled types.
      // $lab:coverage:off$
      throw new Error(`type '${typeName}' is unsupported`);
      // $lab:coverage:on$
  }
}


function mapEnumToJoiType (enumNode) {
  const values = enumNode.getValues();

  for (const value of values) {
    Assert(
      typeof value.value === 'string',
      new Error(`enum '${enumNode.name}': only string values are supported`)
    );
  }

  return Joi.string();
}


function findDirective (node, name) {
  return node.directives.find((dir) => {
    return dir.name.value === name;
  });
}


function argToLowercase (arg) {
  return arg.toLowerCase();
}


module.exports = { ValidateDirective };

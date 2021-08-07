'use strict';
const Assert = require('assert');
const {
  defaultFieldResolver,
  getNamedType,
  isEnumType,
  isInputObjectType,
  isListType,
  isNonNullType,
  Kind
} = require('graphql');
const { MapperKind, mapSchema } = require('@graphql-tools/utils');
const Joi = require('joi');
const { createSchema } = require('./schema');
const kSchema = Symbol('schema');

const joiMethodMapper = new Map([
  // Array validation.
  ['arrayLength', { allowedTypes: ['array'], name: 'length' }],
  ['arrayMax', { allowedTypes: ['array'], name: 'max' }],
  ['arrayMin', { allowedTypes: ['array'], name: 'min' }],
  ['sort', {
    allowedTypes: ['array'],
    argumentMapper (arg) {
      const order = typeof arg.order === 'string' ? arg.order.toLowerCase() :
        undefined;

      return { order, by: arg.by };
    }
  }],
  ['unique', {
    allowedTypes: ['array'],
    argumentMapper (arg) {
      return arg.comparator;
    }
  }],

  // Date validation.
  ['dateGreater', { allowedTypes: ['date'], name: 'greater' }],
  ['dateLess', { allowedTypes: ['date'], name: 'less' }],
  ['dateMax', { allowedTypes: ['date'], name: 'max' }],
  ['dateMin', { allowedTypes: ['date'], name: 'min' }],
  ['timestamp', { argumentMapper: argToLowercase }],

  // Number validation.
  ['greater', { allowedTypes: ['number'] }],
  ['less', { allowedTypes: ['number'] }],
  ['max', { allowedTypes: ['number'] }],
  ['min', { allowedTypes: ['number'] }],
  ['sign', { argumentMapper: argToLowercase }],

  // Object validation.
  ['and', { argumentMapper: argIdentity }],
  ['nand', { argumentMapper: argIdentity }],
  ['or', { argumentMapper: argIdentity }],
  ['oxor', { argumentMapper: argIdentity }],
  ['xor', { argumentMapper: argIdentity }],
  ['with', { argumentMapper (arg) { return [arg.key, ...arg.peers]; } }],
  ['without', { argumentMapper (arg) { return [arg.key, ...arg.peers]; } }],
  ['objectLength', { allowedTypes: ['object'], name: 'length' }],
  ['objectMax', { allowedTypes: ['object'], name: 'max' }],
  ['objectMin', { allowedTypes: ['object'], name: 'min' }],

  // String validation.
  ['case', { argumentMapper: argToLowercase }],
  ['guid', { argumentMapper: argToGuidOptions }],
  ['hex', { argumentMapper (arg) { return { byteAligned: arg }; } }],
  ['ip', { argumentMapper: argToIpOptions }],
  ['length', {
    allowedTypes: ['string'],
    argumentMapper: argToStringLengthOptions
  }],
  ['maxLength', {
    allowedTypes: ['string'],
    name: 'max',
    argumentMapper: argToStringLengthOptions
  }],
  ['minLength', {
    allowedTypes: ['string'],
    name: 'min',
    argumentMapper: argToStringLengthOptions
  }],
  ['pattern', { argumentMapper: argToPatternOptions }],
  ['regex', { allowedTypes: ['string'], argumentMapper: argToPatternOptions }],
  ['uuid', { argumentMapper: argToGuidOptions }],

  // Helpers.
  ['arrayPrefs', {
    name: 'prefs',
    allowedTypes: ['array'],
    argumentMapper: argIdentity
  }],
  ['prefs', { argumentMapper: argIdentity }],
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


function validateDirective (directiveName) {
  return {
    validateDirectiveTypeDefs: createSchema(directiveName),
    validateDirectiveTransformer (schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD] (fieldConfig, fieldName, typeName, schema) {
          const usesDirective = fieldConfig.astNode.arguments.some((arg) => {
            return findDirective(arg, directiveName);
          });

          if (!usesDirective) {
            return;
          }

          wrapResolver(fieldConfig);
          const joiSchema = fieldConfig.resolve[kSchema];

          for (const argName in fieldConfig.args) {
            const arg = fieldConfig.args[argName];
            const directive = findDirective(arg.astNode, directiveName);

            if (directive === undefined) {
              continue;
            }

            mapGqlToJoiType(arg.type, joiSchema, argName, directive.arguments);
          }

          return fieldConfig;
        },
        [MapperKind.INPUT_OBJECT_FIELD] (
          fieldConfig, fieldName, typeName, schema
        ) {
          const { astNode, type } = fieldConfig;
          const directive = findDirective(astNode, directiveName);

          if (directive === undefined) {
            return;
          }

          const objectType = schema.getType(typeName);
          addSchemaToInputObject(objectType);
          const joiSchema = objectType[kSchema];
          mapGqlToJoiType(type, joiSchema, fieldName, directive.arguments);

          return fieldConfig;
        }
      });
    }
  };
}


function parseGqlValue (gqlValue) {
  switch (gqlValue.kind) {
    case Kind.INT :
    case Kind.FLOAT :
      return Number(gqlValue.value);
    case Kind.LIST :
      return gqlValue.values.map(parseGqlValue);
    case Kind.OBJECT :
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
  // $lab:coverage:off$
  if (resolve[kSchema] === undefined) {
  // $lab:coverage:on$
    const resolver = async function (parent, args, context, info) {
      // Handle input validation.
      const schema = Joi.object(resolver[kSchema]);
      const validatedArgs = Joi.attempt(args, schema, {
        allowUnknown: true,
        convert: false
      });

      // Invoke the original resolver.
      // eslint-disable-next-line no-return-await
      return await resolve.call(this, parent, validatedArgs, context, info);
    };

    resolver[kSchema] = {};
    field.resolve = resolver;
  }
}


function addSchemaToInputObject (inputObject) {
  if (inputObject[kSchema] === undefined) {
    inputObject[kSchema] = {};
  }
}


function mapGqlToJoiType (gqlType, joiSchema, fieldName, dirArgs) {
  const namedType = getNamedType(gqlType);
  let joiType;

  if (isListType(gqlType) ||
      (isNonNullType(gqlType) && isListType(gqlType.ofType))) {
    const namedTypeArgs = dirArgs.filter((arg) => {
      const mapper = joiMethodMapper.get(arg.name.value);

      return !(
        mapper && mapper.allowedTypes && mapper.allowedTypes.includes('array')
      );
    });

    dirArgs = dirArgs.filter((arg) => {
      const mapper = joiMethodMapper.get(arg.name.value);

      return mapper &&
        mapper.allowedTypes &&
        mapper.allowedTypes.includes('array');
    });
    joiType = Joi.array().items(
      mapGqlToJoiType(namedType, joiSchema, fieldName, namedTypeArgs)
    );
  } else if (isInputObjectType(namedType)) {
    // Ensure that the input object has a schema annotation, even if there is
    // no directive attached to it. This is to allow validation on child
    // objects.
    addSchemaToInputObject(namedType);

    const inputObjectSchema = namedType[kSchema];
    const fields = namedType.getFields();

    for (const fieldName in fields) {
      if (!(fieldName in inputObjectSchema)) {
        const field = fields[fieldName];

        mapGqlToJoiType(field.type, inputObjectSchema, fieldName, []);
      }
    }

    joiType = Joi.object(inputObjectSchema);

    // Apply any validation defined on the input type itself.
    const inputObjectDirective = namedType.astNode.directives.find((dir) => {
      return dir.name.value === 'validate';
    });

    if (inputObjectDirective) {
      joiSchema[fieldName] = joiType;
      applyDirectiveArguments(
        joiSchema, fieldName, inputObjectDirective.arguments
      );
      joiType = joiSchema[fieldName];
    }
  } else if (isEnumType(namedType)) {
    joiType = mapEnumToJoiType(namedType);
  } else {
    const typeName = namedType.name;

    switch (typeName) {
      case 'String' :
      case 'ID' :
        joiType = Joi.string();
        break;
      case 'Int' :
        joiType = Joi.number().integer();
        break;
      case 'Float' :
        joiType = Joi.number();
        break;
      case 'Boolean' :
        joiType = Joi.boolean();
        break;
      default :
        // Unhandled types.
        // $lab:coverage:off$
        throw new Error(`type '${typeName}' is unsupported`);
        // $lab:coverage:on$
    }
  }

  joiSchema[fieldName] = joiType;
  applyDirectiveArguments(joiSchema, fieldName, dirArgs);

  return joiSchema[fieldName];
}


function applyDirectiveArguments (joiSchema, fieldName, dirArgs) {
  for (let i = 0; i < dirArgs.length; ++i) {
    const directiveArgument = dirArgs[i];
    const argName = directiveArgument.name.value;
    const argValue = parseGqlValue(directiveArgument.value);
    const mapper = joiMethodMapper.get(argName);
    let joiMethod = argName;
    let joiArgs = [argValue];
    let joiAllowedTypes;

    if (mapper !== undefined) {
      const { allowedTypes, name, argumentMapper, typeCast } = mapper;

      if (allowedTypes) {
        joiAllowedTypes = allowedTypes;
      }

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
    }

    if (typeof joiSchema[fieldName][joiMethod] !== 'function' ||
        (Array.isArray(joiAllowedTypes) &&
        !joiAllowedTypes.includes(joiSchema[fieldName].type))) {
      throw new Error(`'${argName}' cannot be used to validate '${fieldName}'`);
    }

    joiSchema[fieldName] = joiSchema[fieldName][joiMethod](...joiArgs);
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


function argIdentity (arg) {
  return arg;
}


function argToLowercase (arg) {
  return arg.toLowerCase();
}


function argToStringLengthOptions (arg) {
  return [arg.limit, arg.encoding];
}


const guidSeparatorToJoi = new Map([
  ['NONE', false],
  ['COLON', ':'],
  ['DASH', '-'],
  ['COLON_OR_DASH', true]
]);

function argToGuidOptions (arg) {
  const separator = guidSeparatorToJoi.get(arg.separator);
  let version;

  if (Array.isArray(arg.version)) {
    version = arg.version.map(argToLowercase);
  }

  return { version, separator };
}


function argToIpOptions (arg) {
  let version;
  let cidr;

  if (Array.isArray(arg.version)) {
    version = arg.version.map(argToLowercase);
  }

  if (typeof arg.cidr === 'string') {
    cidr = argToLowercase(arg.cidr);
  }

  return { version, cidr };
}


function argToPatternOptions (arg) {
  const { pattern, flags, name, invert } = arg;

  Assert(typeof pattern === 'string', new Error('pattern is required'));

  return [new RegExp(pattern, flags), { name, invert }];
}


module.exports = { validateDirective };

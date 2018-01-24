'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.implementsLatticeSDLConfig = implementsLatticeSDLConfig;
exports.isTypeConfig = isTypeConfig;
exports.isScalarConfig = isScalarConfig;
exports.isInterfaceConfig = isInterfaceConfig;
exports.isUnionConfig = isUnionConfig;
exports.representsType = representsType;

var _SyntaxTree = require('./SyntaxTree');

/**
 * Checks to see if the object has a name, schema and/or type property. These
 * properties are used by the GraphQL Lattice Core factory to generate GraphQL
 * types
 *
 * @method Core.implementsLatticeSDLConfig
 * @since 3.0.0
 *
 * @param {LatticeNamedSDL} config an object conforming to the flow type
 * `LatticeNamedSDL`
 * @returns {boolean} true if the object conforms; false otherwise
 */
function implementsLatticeSDLConfig(config) {
  let hasRequireds = config && config.schema && config.name;
  let hasOptionals = hasRequireds && config.type;

  return !!(hasRequireds && hasOptionals || hasRequireds);
}

/**
 * Checks to see if the `config` object contains the expected fields
 * that make up a LatticeTypeConfig object. At the very least, for it
 * to work with the factory, it must have a name and schema string.
 *
 * @method Core.isTypeConfig
 * @since 3.0.0
 *
 * @param {LatticeTypeConfig} config an Object that contains at least
 * `LatticeNamedSDL` features.
 * @return {boolean} true if the object supplied meets the specifications
 * of a `LatticeTypeConfig` object.
 */
/**
 * @module Core
 * 
 */

function isTypeConfig(config) {
  let hasRequireds = implementsLatticeSDLConfig(config);
  let hasOptionals = hasRequireds && config.queries && config.mutations && config.subscriptions;

  return !!(hasRequireds && hasOptionals || hasRequireds);
}

/**
 * Checks to see if the `config` object contains the expected fields
 * that make up a LatticeScalarConfig object.
 *
 * @method Core.isScalarConfig
 * @since 3.0.0
 *
 * @param {LatticeScalarConfig} config an Object that contains at least
 * `LatticeScalarConfig` properties
 * @return {boolean} true if the object supplied meets the specifications
 * of a `LatticeScalarConfig` object.
 */
function isScalarConfig(config) {
  return !!(implementsLatticeSDLConfig(config) && config.parseValue && config.parseLiteral && config.serialize);
}

/**
 * Checks to see if the `config` object contains the expected fields
 * that make up a `LatticeInterfaceConfig` object.
 *
 * @method Core.isInterfaceConfig
 * @since 3.0.0
 *
 * @param {LatticeInterfaceConfig} config an Object that contains at least
 * `LatticeInterfaceConfig` properties
 * @return {boolean} true if the object supplied meets the specifications
 * of a `LatticeInterfaceConfig` object.
 */
function isInterfaceConfig(config) {
  let meetsObjectType = isTypeConfig(config);

  return meetsObjectType && config.resolveType || meetsObjectType;
}

/**
 * Checks to see if the `config` object contains the expected fields
 * that make up a `LatticeUnionConfig` object.
 *
 * @method Core.isUnionConfig
 * @since 3.0.0
 *
 * @param {LatticeUnionConfig} config an Object that contains at least
 * `LatticeUnionConfig` properties
 * @return {boolean} true if the object supplied meets the specifications
 * of a `LatticeUnionConfig` object.
 */
function isUnionConfig(config) {
  return !!(implementsLatticeSDLConfig && config.resolveType);
}

/**
 * This function takes a type name as `matches` and checks the supplied
 * config object to see if the type matches. Optionally, a deeper check
 * that parses the schema of the config can be performed by supplying
 * true to `validateExistence`.
 *
 * @method Core.representsType
 * @since 3.0.0
 *
 * @param {string} matches the name of the type, enum, interface, scalar,
 * or union to search for
 * @param {LatticeTypeConfig | LatticeNamedSDL} config the config object
 * to search within for the named `match`
 * @param {boolean} validateExistence true if the schema should be parsed
 * rather than simply returning `config && config.name === matches`
 * @returns {boolean} true if the name of the GraphQL object matches the
 * supplied string.
 */
function representsType(matches, config, validateExistence = false) {
  if (!validateExistence) {
    return !!(config && config.name && config.name === matches);
  } else {
    let schema = config && config.schema;
    let tree = _SyntaxTree.SyntaxTree.from(config);
    let outline = tree.outline;

    return outline && (outline.types && outline.types[matches] || outline.enums && outline.enums[matches] || outline.interfaces && outline.interfaces[matches] || outline.unions && outline.unions[matches] || outline.scalars && outline.scalars[matches]);
  }
}
//# sourceMappingURL=language.js.map
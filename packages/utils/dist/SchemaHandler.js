'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaHandler = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _latticeCore = require('@nyteshade/lattice-core');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The SchemaHandler class is a lightweight wrapper around a GraphQLSchema
 * instance. Its purpose is to make navigating, altering and modifying the
 * schema easier. It does this by exposing some of the built-in methods of
 * the GraphQLSchema instance and by providing a suite of its own variants
 *
 * @since 3.0.0
 */
class SchemaHandler {
  /**
   * The schema instance this handler wraps
   *
   * @type {GraphQLSchema}
   */
  constructor(schema, resolvers) {
    if (typeof schema === 'string') {
      schema = (0, _graphql.buildSchema)(schema);
      this.resolvers = resolvers;
    }

    if (!(0, _graphql.isSchema)(schema)) {
      throw new Error("Supplied schema object or string is not valid");
    }

    this.schema = schema;
  }

  // TODO fix  type


  /**
   * An object that maps to the various resolvers that make this schema
   * executable. Format varies depending on the engine in question. The
   * Facebook reference implementation tends to use a slightly more flat
   * layout than that of the Apollo server engine
   *
   * @type {Object}
   */
  get types() {
    return this.schema._typeMap;
  }

  hasType(nameOrRegex) {
    if (Object.prototype.toString.apply(nameOrRegex) === '[object RegExp]') {
      let keys = (0, _keys2.default)(this.schema._typeMap);

      return !!keys.filter(key => nameOrRegex.test(key)).length;
    } else if (typeof nameOrRegex === 'string') {
      return nameOrRegex in this.schema._typeMap;
    } else {
      return false;
    }
  }

  // TODO fix  type
  getType(name) {
    return this.types[name];
  }

  // todo
  //  - addType (function)
  //  - resolvers (map of types with resolvers for values)

}
exports.SchemaHandler = SchemaHandler;
//# sourceMappingURL=SchemaHandler.js.map
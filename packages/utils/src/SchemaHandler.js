// @flow

import { SyntaxTree } from '@nyteshade/lattice-core'
import { parse, graphqlSync, buildSchema, isSchema } from 'graphql'

import type { GraphQLSchema, Source } from 'graphql'

/**
 * The SchemaHandler class is a lightweight wrapper around a GraphQLSchema
 * instance. Its purpose is to make navigating, altering and modifying the
 * schema easier. It does this by exposing some of the built-in methods of
 * the GraphQLSchema instance and by providing a suite of its own variants
 *
 * @since 3.0.0
 */
export class SchemaHandler {
  /**
   * The schema instance this handler wraps
   *
   * @type {GraphQLSchema}
   */
  schema: GraphQLSchema

  /**
   * An object that maps to the various resolvers that make this schema
   * executable. Format varies depending on the engine in question. The
   * Facebook reference implementation tends to use a slightly more flat
   * layout than that of the Apollo server engine
   *
   * @type {Object}
   */
  resolvers: ?Object

  /**
   *
   */
  constructor(schema: GraphQLSchema|string, resolvers?: Object) {
    if (typeof schema === 'string') {
      schema = buildSchema(schema)
      this.resolvers = resolvers
    }

    if (!isSchema(schema)) {
      throw new Error("Supplied schema object or string is not valid");
    }

    this.schema = schema
  }

  // TODO fix @flow type
  get types(): Object {
    return this.schema.getTypeMap()
  }

  hasType(nameOrRegex: string): boolean {
    if (Object.prototype.toString.apply(nameOrRegex) === '[object RegExp]') {
      let keys = Object.keys(this.schema.getTypeMap())

      return !!keys.filter(key => nameOrRegex.test(key)).length
    }
    else if (typeof nameOrRegex === 'string') {
      return nameOrRegex in this.schema.getTypeMap()
    }
    else {
      return false;
    }
  }

  // TODO fix @flow type
  getType(name: string): Object {
    return this.schema.getType(name)
  }

  // todo
  //  - addType (function)
  //  - resolvers (map of types with resolvers for values)
}

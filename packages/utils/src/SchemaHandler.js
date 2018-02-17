// @flow

import { SyntaxTree } from '@nyteshade/lattice-core'
import { parse, graphqlSync, buildSchema, isSchema } from 'graphql'

import type { GraphQLSchema, Source } from 'graphql'

export class SchemaHandler {
  schema: GraphQLSchema

  resolvers: mixed

  constructor(schema: GraphQLSchema|string, resolvers?: mixed) {
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
    return this.schema._typeMap
  }

  hasType(nameOrRegex: string): boolean {
    if (Object.prototype.toString.apply(nameOrRegex) === '[object RegExp]') {
      let keys = Object.keys(this.schema._typeMap)

      return !!keys.filter(key => nameOrRegex.test(key)).length
    }
    else if (typeof nameOrRegex === 'string') {
      return nameOrRegex in this.schema._typeMap
    }
    else {
      return false;
    }
  }

  // TODO fix @flow type
  getType(name: string): Object {
    return this.types[name]
  }

  // todo
  //  - addType (function)
  //  - resolvers (map of types with resolvers for values)

}

#!/usr/bin/env node -r source-map-support/register

let repl = require('repl')
let { merge } = require('lodash')
let { graphql, parse, print, buildASTSchema } = require('graphql')
let { factory, SyntaxTree, ConfigParser } = require('.')

let db = new Map()
let cp = new ConfigParser('./test')

db.set('Brielle', {
  name: 'Brielle',
  gender: 'Female',
  identity: 'Transgender',
  age: 41
})

db.set('Deborah', {
  name: 'Deborah',
  gender: 'Female',
  identity: 'Cisgender',
  age: 53
})

let config = {
  name: 'Person',
  schema: `
    interface Human {
      name: String!
      gender: Gender!
    }

    enum Gender {
      Male, Female, NonBinary
    }

    enum GenderIdentity {
      Cisgender, Transgender
    }

    type Person implements Human {
      name: String!
      gender: Gender!
      identity: GenderIdentity
      age: Int
    }

    type Query {
      findPerson(name: String!): Person
      allPeople: [Person]
    }

    input NewPersonConfig {
      name: String!
      identity: GenderIdentity
      age: Int
      gender: Gender!
    }

    type Mutation {
      createPerson(person: NewPersonConfig): Person
    }
  `,
  queries: {
    findPerson(root, { name }, context, info) {
      return db.get(name)
    },

    allPeople(root, args, context, info) {
      return Array.from(db.values())
    }
  },
  mutations: {
    createPerson(root, { person }, context, info) {
      db.set(person.name, person)
    }
  }
}

let st = SyntaxTree.from(config.schema)
let st2 = SyntaxTree.from('enum Gender { TransFeminine }')

let configs = cp.parseSync()
let schema = factory([config].concat(configs))

let context = merge(global, {
  factory, merge, SyntaxTree, db, config, st, st2,
  graphql, buildASTSchema, parse, print, global,
  mp, ConfigParser, configs, schema,
  gqlctx: (schema, source, context = {}) => {
    graphql(schema, source, undefined, context).
      then(o => {global.rc = o; console.log(o) })
  }
});

Object.defineProperty(context, 'help', { get: () => {
console.log(`
Welcome to the graphql-lattice/core repl bootstrapping process, the
following objects are in scope for you to use

  config       - a config with a query, mutation, type and enums
                 as well as functions to manage the executable types
  configs      - an array of config objects parsed using ModuleParser
                 .parseSync()
  schema       - a schema created using factory([config].concat(configs))
  db           - a map that serves as the database for the config
  mp           - instance of ModuleParser pointed to './test'
  merge        - lodash's merge
  SyntaxTree   - graphql-lattice/core's SyntaxTree
  ConfigParser - reads a directory tree and read various js configs
  factory      - the new core method for graphql-lattice/core
  st           - an instance of SyntaxTree.from(config.schema)

  graphql      - for executing source against a schema
  parse        - for generating DocumentNodes from SDL
  print        - for reverting DocumentNodes to SDL
  gqlctx       - a custom function that takes your schema, source and an
                 optional context object and does the following with a
                 schema:
                   graphql(schema,source,undefined,context||{})
                     .then(o => {global.rc = o; console.log(o)})
`)
}})

context.help

merge(repl.start('> ').context, context)

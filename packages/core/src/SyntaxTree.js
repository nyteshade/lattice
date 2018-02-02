// @flow
// @module SyntaxTree

import { typeOf } from './types'
import { print, parse, buildASTSchema } from 'graphql'
import { merge } from 'lodash'
import { LatticeLogs as ll } from './utils'

import type { GraphQLObjectType, GraphQLType } from 'graphql/type/definition'
import type { GraphQLSchema } from 'graphql/type/schema'
import type {
  ASTNode,
  DocumentNode,
  DefinitionNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode
} from 'graphql/language/ast'


// Shorthand for the key storing the internal AST
// @prop
const AST_KEY = Symbol.for('Internal AST Storage Key');

/**
 * A parser and processor of GraphQL IDL Abstract Syntax Trees. Used to combine
 * a set of {@link GQLBase} class instances.
 *
 * @class SyntaxTree
 */
export class SyntaxTree
{
  /**
   * Constructs a new `SyntaxTree` object. If a string schema is supplied or
   * an already parsed AST object, either of which is valid GraphQL IDL, then
   * its parsed AST will be the internals of this object.
   *
   * @constructor
   * @memberof SyntaxTree
   * @method ⎆⠀constructor
   *
   * @param {string|DocumentNode|SyntaxTree} schemaOrASTOrST if supplied the
   * tree will be constructed with the contents of the data. If a string
   * of IDL is given, it will be parsed. If an AST is given, it will be
   * verified. If a SyntaxTree is supplied, it will be copied.
   */
  constructor(schemaOrASTOrST?: string | DocumentNode | SyntaxTree) {
    // $ComputedType
    this[AST_KEY] = {};

    if (schemaOrASTOrST) {
      this.setAST(schemaOrASTOrST);
    }
  }

  /**
   * Getter that retrieves the abstract syntax tree created by `graphql.parse`
   * when it is presented with a valid string of IDL.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⬇︎⠀ast
   *
   * @return {DocumentNode} a GraphQL AST object
   */
  get ast(): DocumentNode {
    // $ComputedType
    return this[AST_KEY];
  }

  /**
   * Setter that assigns the abstract syntax tree, typically created by
   * `graphql.parse` when given a valid string of IDL.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⬆︎⠀ast
   *
   * @param {Object} value a valid AST object. Other operations will act
   * in an undefined manner should this object not be a valid AST
   */
  set ast(value: DocumentNode): void {
    // $ComputedType
    this[AST_KEY] = value;
  }

  /**
   * Sets the underlying AST object with either schema which will be parsed
   * into a valid AST or an existing AST. Previous ast values will be erased.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⌾⠀setAST
   *
   * @param {string|Object} schemaOrAST a valid GraphQL IDL schema or a
   * previosuly parsed or compatible GraphQL IDL AST object.
   * @return {SyntaxTree} this for inlining.
   */
  setAST(schemaOrASTOrST: string | DocumentNode | SyntaxTree): SyntaxTree {
    this.ast = {};

    const type = typeOf(schemaOrASTOrST);
    let ast: DocumentNode;
    let st: SyntaxTree;

    switch (type) {
      case String.name:
        try {
          ast = parse((schemaOrASTOrST: string));

          merge(this.ast, ast);
        }
        catch (ignore) { /* Ignore this error */ }

        break;
      case Object.name:
        ast = (schemaOrASTOrST: DocumentNode);

        try {
          ast = parse(print(ast));
          merge(this.ast, ast);
        }
        catch (ignore) { /* Ignore this error */ }

        break;
      case SyntaxTree.name:
        st = (schemaOrASTOrST: SyntaxTree);

        merge(this.ast, st.ast);

        break;
    }

    return this;
  }

  /**
   * As passthru update method that works on the internal AST object. If
   * an error occurs, the update is skipped. An error can occur if adding the
   * changes would make the AST invalid. In such a case, the error is logged
   * to the error console.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⌾⠀updateAST
   *
   * @param {DocumentNode} ast an existing GraphQL IDL AST object that will be
   * merged on top of the existing tree using _.merge()
   * @return {SyntaxTree} this for inlining.
   */
  updateAST(ast: DocumentNode): SyntaxTree {
    if (typeOf(ast) === Object.name) {
      let newAST: DocumentNode = merge({}, this.ast, ast);

      try {
        print(newAST);
        this.ast = merge(this.ast, ast);
      }
      catch (error) {
        ll.error('[SyntaxTree] Failed to updateAST with %o', ast);
        ll.error('Resulting object would be %o', newAST);
        ll.error(error);
      }
    }

    return this;
  }

  /**
   * The `GraphQLSchema` produced by this getter is sufficient to work with
   * tools like express-graphql or Apollo server but is more than likely not
   * executable. Use `SchemaUtils#injectAll` to populate this schema with
   * resolvers and docs and the rest.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⬇︎⠀schema
   *
   * @return {GraphQLSchema} a GraphQLSchema object instance based on the
   * internal AST as built
   */
  get schema(): GraphQLSchema {
    return buildASTSchema(this.ast)
  }

  /**
   * Appends all definitions from another AST to this one. The method will
   * actually create a copy using SyntaxTree.from() so the input types can
   * be any one of a valid GraphQL IDL schema string, a GraphQL IDL AST or
   * another SyntaxTree object instance.
   *
   * Definitions of the same name but different kinds will be replaced by the
   * new copy. Those of the same kind and name will be merged (TODO handle more
   * than ObjectTypeDefinition kinds when merging; currently other types are
   * overwritten).
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⌾⠀appendDefinitions
   *
   * @param {string|Object|SyntaxTree} schemaOrASTOrST an instance of one of
   * the valid types for SyntaxTree.from() that can be used to create or
   * duplicate the source from which to copy definitions.
   * @return {SyntaxTree} this for inlining
   */
  appendDefinitions(
    schemaOrASTOrST: string | DocumentNode | SyntaxTree
  ): SyntaxTree {
    const source = SyntaxTree.from(schemaOrASTOrST);
    const set = new Set();

    this.ast.definitions.map((definition: DefinitionNode) => {
      set.add(definition.name.value);
    })

    if (source && source.ast.definitions && this.ast.definitions) {
      for (let theirs: DocumentNode of (source: any)) {
        let name = theirs.name.value;
        let ours: DocumentNode = this.find(name);
        let index = ours && this.ast.definitions.indexOf(ours) || -1;

        // We don't yet have one with that name
        if (!set.has(name)) {
          set.add(name);
          this.ast.definitions.push(theirs);
        }

        // We do have one with that name
        else {
          // The kinds aren't the same, just replace theirs with ours
          // TODO add a prefs line that offers different ways of dealing
          // with this merged situation. First obvious solution would be
          // to THROW, the other option is use the SOURCE or EXISTING
          if (theirs.kind !== ours.kind) {
            // replace with the new one
            this.ast.definitions[index] = theirs;
          }

          // The kinds are the same, lets just merge their fields
          else {
            // merge the properties of the same types.
            switch (theirs.kind) {
              case 'ObjectTypeDefinition':
                ours.interfaces = [].concat(ours.interfaces, theirs.interfaces)
                ours.directives = [].concat(ours.directives, theirs.directives)
                ours.fields = [].concat(ours.fields, theirs.fields)

                break;
              case 'EnumTypeDefinition':
                let map = new Map()

                for (
                  let side: EnumValueDefinitionNode of
                  ours.values.concat(theirs.values)
                ) {
                  if (!map.has(side.name.value)) {
                    map.set(side.name.value, side)
                  }
                }

                ours.values = Array.from(map.values())

                break;
              default:
                // Since we don't support other types yet. Let's replace
                this.ast.definitions[index] = theirs;
                break;
            }
          }
        }
      }
    }

    return this;
  }

  /**
   * This method finds the Query type definitions in the supplied AST or
   * SyntaxTree objects, takes its defined fields and adds it to the current
   * instances. If this instance does not have a Query type defined but the
   * supplied object does, then the supplied one is moved over. If neither
   * has a query handler, then nothing happens.
   *
   * NOTE this *removes* the Query type definition from the supplied AST or
   * SyntaxTree object.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⌾⠀consumeDefinition
   *
   * @param {Object|SyntaxTree} astOrSyntaxTree a valid GraphQL IDL AST or
   * an instance of SyntaxTree that represents one.
   * @param {string|RegExp} definitionType a valid search input as would be
   * accepted for the #find() method of this object.
   * @return {SyntaxTree} returns this for inlining
   */
  consumeDefinition(
    astOrSyntaxTree: DocumentNode | SyntaxTree,
    definitionType: string | RegExp = "Query"
  ): SyntaxTree {
    if (!astOrSyntaxTree || !this.ast || !this.ast.definitions) { return this }

      const tree: SyntaxTree = (typeOf(astOrSyntaxTree) === SyntaxTree.name
        ? astOrSyntaxTree
        : SyntaxTree.from(astOrSyntaxTree));
      let left = this.find(definitionType);
      let right = tree.find(definitionType) || null;

    if (!tree) {
      ll.error('There seems to be something wrong with your tree')
      ll.error(new Error('Missing tree; continuing...'));
      return this;
    }

    if (!right) { return this }

    if (!left) {
      this.ast.definitions.push(right);

      // Remove the copied definition from the source
      tree.ast.definitions.splice(tree.ast.definitions.indexOf(right), 1);

      return this;
    }

    // TODO support other types aside from ObjectTypeDefinitions
    // TODO see if there is a better way to achieve this with built-in
    // graphql code someplace
    switch(left.kind) {
      case 'ObjectTypeDefinition':
        if (left.interfaces && right.interfaces) {
          left.interfaces = [].concat(left.interfaces, right.interfaces);
        }

        if (left.directives && right.directives) {
          left.directives = [].concat(left.directives, right.directives);
        }

        if (left.fields && right.fields) {
          left.fields = [].concat(left.fields, right.fields);
        }

        break;
      default:
        break;
    }

    // Remove the copied definition from the source
    tree.ast.definitions.splice(tree.ast.definitions.indexOf(right), 1);

    return this;
  }

  /**
   * A function that looks into the supplied `SyntaxTree` or AST and
   * tries to consume or merge all the executable shared type fields;
   * namely Query, Mutation and Subscription. If given an instance of
   * `SyntaxTree` it
   */
  consumeAllExecutableTypes(astOrSyntaxTree: DocumentNode | SyntaxTree) {
    let types = []
    let schema

    if (typeOf(astOrSyntaxTree) === SyntaxTree.name) {
      schema = astOrSyntaxTree.schema
    }
    else {
      schema = SyntaxTree.from(astOrSyntaxTree).schema
    }

    types.push(schema._queryType)
    types.push(schema._mutationType)
    types.push(schema._subscriptionType)

    for (let type of types) {
      this.consumeDefinition(astOrSyntaxTree, type)
    }

    return this;
  }


  /**
   * When iterating over an instance of SyntaxTree, you are actually
   * iterating over the definitions of the SyntaxTree if there are any;
   *
   * @instance
   * @memberof SyntaxTree
   * @method *[Symbol.iterator]
   *
   * @return {TypeDefinitionNode} an instance of a TypeDefinitionNode; see
   * graphql/language/ast.js.flow for more information
   * @ComputedType
   */
  *[Symbol.iterator](): TypeDefinitionNode {
    if (this[AST_KEY].definitions) {
      return yield* this[AST_KEY].definitions;
    }
    else {
      return yield* this;
    }
  }

  /**
   * AST DocumentNode types can be annoyingly nested within themselves
   * Examples are `NonNullType -> ListType -> "true" type`. And variations
   * thereof. Rather than repeating this code elsewhere, a nice function
   * to examine and derive that information is presented below.
   *
   * @instance
   * @memberof SyntaxTree
   * @method readType
   *
   * @param {TypeNode} typeNode the object in a DocumentNode keyed as `type`
   */
  static readType(typeNode: TypeNode, setName: ?String): {
    required: boolean,
    array: boolean,
    type: string,
    name: ?string
  } {
    let result: Object = {
      required: typeNode.kind === 'NonNullType',
      array: typeNode.kind === 'ListType'
        || (typeNode.type && typeNode.type.kind === 'ListType')
        || false,
      type:
        (typeNode.type
         && typeNode.type.type
         && typeNode.type.type.type
         && typeNode.type.type.type.name
         && typeNode.type.type.type.name.value)
        ||
        (typeNode.type
         && typeNode.type.type
         && typeNode.type.type.name
         && typeNode.type.type.name.value)
        || (typeNode.type && typeNode.type.name && typeNode.type.name.value)
        || (typeNode.name && typeNode.name.value)
        || undefined
    }

    if (setName) {
      result.name = setName
    }

    return result;
  }

  /**
   * Getter that builds a small outline object denoting the schema being
   * processed. If you have a schema that looks like the following:
   *
   * ```javascript
   * let st = SyntaxTree.from(`
   *   type Contrived {
   *     name: String
   *     age: Int
   *   }
   *
   *   type Query {
   *     getContrived: Contrived
   *   }
   * `)
   * let outline = st.outline
   * ```
   *
   * You will end up with an object that looks like the following:
   *
   * ```javascript
   * {
   *   Contrived: { name: 'String', age: 'Int' },
   *   Query: { getContrived: 'Contrived' }
   * }
   * ```
   *
   * As may be evidenced by the example above, the name of the type is
   * represented by an object where the name of each field (sans arguments)
   * is mapped to a string denoting the type.
   */
  get outline(): Object {
    let outline = {
      interfaces:{},
      types:{},
      enums:{},
      unions:{},
      inputs:{},
      scalars:[]
    }
    let interfaces = Symbol.for('interfaces')

    for (let definition: DefinitionNode of this) {
      let out

      switch (definition.kind) {
        case 'InputObjectTypeDefinition':
        case 'InterfaceTypeDefinition':
        case 'ObjectTypeDefinition':
          let key = 'InterfaceTypeDefinition' === definition.kind
            ? 'interfaces'
            : ('ObjectTypeDefinition' === definition.kind)
              ? 'types'
              : 'inputs'
          out = outline[key][definition.name.value] = {}
          definition.fields.forEach(
            (field: FieldDefinitionNode) => {
              let name = field.name.value
              out[name] = SyntaxTree.readType(field.type, name)

              if (field.arguments) {
                out[name].args = field.arguments.map(arg => {
                  return {
                    [arg.name.value]: SyntaxTree.readType(
                      arg.type,
                      arg.name.value
                    )
                  }
                })
              }
              else {
                out[name].args = []
              }
            }
          )

          if (definition.interfaces) {
            out = (out[interfaces] = out[interfaces] || [])

            definition.interfaces.forEach(
              _interface => out.push(_interface.name.value)
            )
          }

          break;

        case 'EnumTypeDefinition':
          out = outline.enums[definition.name.value] = []
          definition.values.forEach(
            value => out[value.name.value] = value.name.value
          )
          break;

        case 'UnionTypeDefinition':
          out = outline.unions[definition.name.value] = []
          definition.types.forEach(
            type => out.push(type.name.value)
          )
          break;

        case 'ScalarTypeDefinition':
          out = outline.scalars
          out.push(definition.name.value)
          break;
      }
    }

    return outline
  }

  /**
   * Iterate through the definitions of the AST if there are any. For each
   * definition the name property's value field is compared to the supplied
   * definitionName. The definitionName can be a string or a regular
   * expression if finer granularity is desired.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⌾⠀find
   *
   * @param {string|RegExp} definitionName a string or regular expression used
   * to match against the definition name field in a given AST.
   * @return {Object|null} a reference to the internal definition field or
   * null if one with a matching name could not be found.
   */
  find(definitionName: string|RegExp): Object | null {
    // $ComputedType
    return SyntaxTree.findDefinition(this[AST_KEY], definitionName);
  }

  /**
   * SyntaxTree instances that are toString()'ed will have the graphql method
   * print() called on them to convert their internal structures back to a
   * GraphQL IDL schema syntax. If the object is in an invalid state, it WILL
   * throw an error.
   *
   * @instance
   * @memberof SyntaxTree
   * @method ⌾⠀toString
   *
   * @return {string} the AST for the tree parsed back into a string
   */
  toString(): string {
    // $ComputedType
    return print(this[AST_KEY]);
  }

  /**
   * A runtime constant denoting a query type.
   *
   * @type {string}
   * @static
   * @memberof SyntaxTree
   * @method ⬇︎⠀QUERY
   * @readonly
   * @const
   */
  static get QUERY(): string { return 'Query' }

  /**
   * A runtime constant denoting a mutation type.
   *
   * @type {string}
   * @static
   * @memberof SyntaxTree
   * @method ⬇︎⠀MUTATION
   * @readonly
   * @const
   */
  static get MUTATION(): string { return 'Mutation' }

    /**
   * A runtime constant denoting a subscription type.
   *
   * @type {string}
   * @static
   * @memberof SyntaxTree
   * @method SUBSCRIPTION
   * @readonly
   * @const
   */
  static get SUBSCRIPTION(): string { return 'Subscription' }

  /**
   * Returns the `constructor` name. If invoked as the context, or `this`,
   * object of the `toString` method of `Object`'s `prototype`, the resulting
   * value will be `[object MyClass]`, given an instance of `MyClass`
   *
   * @method ⌾⠀[Symbol.toStringTag]
   * @memberof SyntaxTree
   *
   * @return {string} the name of the class this is an instance of
   * @ComputedType
   */
  get [Symbol.toStringTag]() { return this.constructor.name }

  /**
   * Applies the same logic as {@link #[Symbol.toStringTag]} but on a static
   * scale. So, if you perform `Object.prototype.toString.call(MyClass)`
   * the result would be `[object MyClass]`.
   *
   * @method ⌾⠀[Symbol.toStringTag]
   * @memberof SyntaxTree
   * @static
   *
   * @return {string} the name of this class
   * @ComputedType
   */
  static get [Symbol.toStringTag]() { return this.name }

  /**
   * Given one of, a valid GraphQL IDL schema string, a valid GraphQL AST or
   * an instance of SyntaxTree, the static from() method will create a new
   * instance of the SyntaxTree with the values you provide.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀from
   *
   * @param {String|DocumentNode|SyntaxTree} mixed an instance of one of the
   * valid* types specified above. Everything else will result in a null value.
   * @return {SyntaxTree} a newly created and populated instance of SyntaxTree
   * or null if an invalid type was supplied for mixed.
   */
  static from(mixed: string | DocumentNode | SyntaxTree): SyntaxTree | null {
    let schema: string;
    let ast: Object;

    switch (typeOf(mixed)) {
      case String.name:
        schema = (mixed: any);
        try { parse(schema) } catch(error) { ll.error(error); return null; }

        return SyntaxTree.fromSDL(String(schema));
      case Object.name:
        ast = (mixed: any);
        try { print(ast) } catch(error) { return null; }

        return SyntaxTree.fromAST(ast);
      case SyntaxTree.name:
        schema = mixed.toString();

        return SyntaxTree.from(schema);
      default:
        return null;
    }
  }

  /**
   * Generates a new instance of SyntaxTree from the supplied, valid, GraphQL
   * schema. This method does not perform try/catch validation and if an
   * invalid GraphQL schema is supplied an error will be thrown.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀fromSDL
   *
   * @param {string} schema a valid GraphQL IDL schema string.
   * @return {SyntaxTree} a new instance of SyntaxTree initialized with a
   * parsed response from require('graphql').parse().
   */
  static fromSDL(sdl: string): SyntaxTree {
    const ast = parse(sdl);
    let tree = new SyntaxTree(ast);

    return tree;
  }

  /**
   * Generates a new instance of SyntaxTree from the supplied, valid, GraphQL
   * schema. This method does not perform try/catch validation and if an
   * invalid GraphQL schema is supplied an error will be thrown.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀fromAST
   *
   * @param {DocumentNode} ast a valid GraphQL AST object.
   * @return {SyntaxTree} a new instance of SyntaxTree initialized with a
   * supplied abstract syntax tree generated by require('graphql').parse() or
   * other compatible method.
   */
  static fromAST(ast: DocumentNode): SyntaxTree | null {
    // TODO make sure that we aren't losing anything here
    const source = parse(print(ast));
    let tree = new SyntaxTree(source);

    return source ? tree : null;
  }

  /**
   * Iterate through the definitions of the AST if there are any. For each
   * definition the name property's value field is compared to the supplied
   * definitionName. The definitionName can be a string or a regular
   * expression if finer granularity is desired.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀findDefinition
   *
   * @param {DocumentNode} ast an abstract syntax tree object created
   * from a GQL SDL
   * @param {string|RegExp} definitionName a string or regular expression used
   * to match against the definition name field in a given AST.
   * @return {Object|null} a reference to the internal definition field or
   * null if one with a matching name could not be found.
   */
  static findDefinition(ast: DocumentNode, definitionName: string | RegExp) {
    return this.findInASTArrayByNameValue(
      ast.definitions,
      definitionName
    );
  }

  /**
   * Iterate through the fields of a definition AST if there are any. For each
   * field, the name property's value field is compared to the supplied
   * fieldName. The fieldName can be a string or a regular expression if
   * finer granularity is desired.
   *
   * Before iterating over the fields, however, the definition is found using
   * `SyntaxTree#findDefinition`. If either the field or definition are not
   * found, null is returned.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀findField
   * @since 2.7.0
   *
   * @param {DocumentNode} ast an abstract syntax tree object created
   * from a GQL SDL
   * @param {string|RegExp} definitionName a string or regular expression used
   * to match against the definition name field in a given AST.
   * @param {string|RegExp} fieldName a string or regular expression used
   * to match against the field name field in a given AST.
   * @return {Object|null} an object containing two keys, the first being
   * `field` which points to the requested AST definition field. The second
   * being `meta` which contains three commonly requested bits of data; `name`,
   * `type` and `nullable`. Non-nullable fields have their actual type wrapped
   * in a `NonNullType` GraphQL construct. The actual field type is contained
   * within. The meta object surfaces those values for easy use.
   */
  static findField(
    ast: DocumentNode,
    definitionName: string | RegExp,
    fieldName: string | RegExp
  ) {
    const definition = this.findDefinition(ast, definitionName)
    let meta;

    if (!definition || !definition.fields) {
      return null;
    }

    const field = this.findInASTArrayByNameValue(definition.fields, fieldName)

    if (field) {
      meta = {
        name: field.name && field.name.value || null,
        type: field.type && field.type.kind === 'NonNullType'
          ? field.type.type.name.value
          : field.type && field.type.name && field.type.name.value || null,
        nullable: !!(field.type && field.type.kind !== 'NonNullType')
      }
    }

    return { field, meta };
  }

  /**
   * Enum AST definitions operate differently than object type definitions
   * do. Namely, they do not have a `fields` array but instead have a `values`
   * array. This wrapper method, first finds the enum definition in the ast
   * and then searches the values for the named node desired and returns that
   * or null, if one could not be found.
   *
   * @method SyntaxTree#⌾⠀findEnumDefinition
   * @since 2.7.0
   *
   * @param {DocumentNode} ast the abstract syntax tree parsed by graphql
   * @param {string|RegExp} enumDefinitionName a string or regular expression
   * used to locate the enum definition in the AST.
   * @param {string|RegExp} enumValueName a string or regular expression used
   * to locate the value by name in the values of the enum definition.
   * @return {Object|null} the desired AST node or null if one does not exist
   */
  static findEnumDefinition(
    ast: DocumentNode,
    enumDefinitionName: string | RegExp,
    enumValueName: string | RegExp
  ): ?Object {
    // Fetch the enum definition
    const definition = this.findDefinition(ast, enumDefinitionName);

    // Ensure we have one or that it has a values array
    if (!definition || !definition.values) {
      return null;
    }

    // Return the results of an `findInASTArrayByNameValue()` search of the
    // aforementioned 'values' array.
    return this.findInASTArrayByNameValue(
      definition.values,
      enumValueName
    )
  }

  /**
   * A lot of searching in ASTs is filtering through arrays and matching on
   * subobject properties on each iteration. A common theme is find something
   * by its `.name.value`. This method simplifies that by taking an array of
   * AST nodes and searching them for a `.name.value` property that exists
   * within.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀findInASTArrayByNameValue
   * @since 2.7.0
   *
   * @param {Array} array of mixed AST object nodes containing `name.value`s
   * @param {string|RegExp} name a string or regular expression used
   * to match against the node name value
   * @return {Object|null} the AST leaf if one matches or null otherwise.
   */
  static findInASTArrayByNameValue(
    array: Array<DocumentNode>,
    name: string | RegExp
  ): ?DocumentNode {
    const isRegExp: boolean = /RegExp/.test(typeOf(name));
    const regex = !isRegExp
      // $FlowFixMe
      ? new RegExp(RegExp.escape(name.toString()))
      // $FlowFixMe
      : (name: RegExp);
    const flags = regex.flags
    const source = regex.source
    const reducer = (last,cur,i) => {
      if (last !== -1) return last;
      if (!cur || !cur.name || !cur.name.value) return -1;
      return new RegExp(source, flags).test(cur.name.value) ? i : -1
    }
    const index = array.reduce(reducer, -1);

    return (~index) ? array[index] : null;
  }

  /**
   * Query types in GraphQL are an ObjectTypeDefinition of importance for
   * placement on the root object. There is utility in creating an empty
   * one that can be injected with the fields of other GraphQL object query
   * entries.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀EmptyQuery
   *
   * @return {SyntaxTree} an instance of SyntaxTree with a base AST generated
   * by parsing the graph query, "type Query {}"
   */
  static EmptyQuery(): ?SyntaxTree {
    return SyntaxTree.from(`type ${this.QUERY} {}`);
  }

  /**
   * Mutation types in GraphQL are an ObjectTypeDefinition of importance for
   * placement on the root object. There is utility in creating an empty
   * one that can be injected with the fields of other GraphQL object mutation
   * entries.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀EmptyMutation
   *
   * @return {SyntaxTree} an instance of SyntaxTree with a base AST generated
   * by parsing the graph query, "type Mutation {}"
   */
  static EmptyMutation(): ?SyntaxTree {
    return SyntaxTree.from(`type ${this.MUTATION} {}`);
  }

  /**
   * The starting point for a SyntaxTree that will be built up programmatically.
   *
   * @static
   * @memberof SyntaxTree
   * @method ⌾⠀EmptyDocument
   *
   * @param {string|Object|SyntaxTree} schemaOrASTOrST any valid type taken by
   * SyntaxTree.from() used to further populate the new empty document
   * @return {SyntaxTree} an instance of SyntaxTree with no definitions and a
   * kind set to 'Document'
   */
  static EmptyDocument(
    schemaOrASTOrST?: string | Object | SyntaxTree
  ): SyntaxTree {
    let tree = new SyntaxTree();

    // Due to normal validation methods with ASTs (i.e. converting to string
    // and then back to an AST object), doing this with an empty document
    // fails. Therefore, we manually set the document contents here. This allows
    // toString(), consumeDefinition() and similar methods to still work.
    tree.ast = {
      kind: 'Document',
      definitions: [],
      loc: {start: 0, end: 0}
    };

    if (schemaOrASTOrST) {
      tree.appendDefinitions(schemaOrASTOrST);
    }

    return tree;
  }
}

export default SyntaxTree;

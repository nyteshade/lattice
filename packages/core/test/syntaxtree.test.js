import { SyntaxTree } from '../src/SyntaxTree'
import { dedent as gql } from 'ne-tag-fns'

describe('Check for AST DocumentNode consumption', () => {
  it('should be able to merge two separate different schema Queries', () => {
    let treeA = SyntaxTree.from(gql`
      type Query {
        query1(id: String!): Boolean
      }
    `)

    let treeB = SyntaxTree.from(gql`
      type Query {
        query2(count: Int!): Float
      }
    `)

    treeA.consumeDefinition(treeB)

    expect(treeA.outline.Query.query1).toBeDefined()
    expect(treeA.outline.Query.query2).toBeDefined()
  })

  it('should be able to convert to and from SDL', () => {
    let SDL = gql`
      type Planet {
        id: ID
      }
    `.trim()

    let tree = SyntaxTree.from(SDL)

    expect(tree.schema._typeMap.Planet).toBeDefined()
    expect(tree.toString().trim()).toEqual(SDL)
  })

  it('should be able to determine a quick outline', () => {
    let SDL = gql`type Planet { id: ID name: String sector: Float }`
    let outline = SyntaxTree.from(SDL).outline

    expect(outline.Planet).toBeDefined()
    expect(outline.Planet.id).toBeDefined()
    expect(outline.Planet.id).toEqual('ID')
    expect(outline.Planet.name).toBeDefined()
    expect(outline.Planet.name).toEqual('String')
    expect(outline.Planet.sector).toBeDefined()
    expect(outline.Planet.sector).toEqual('Float')
  })
})

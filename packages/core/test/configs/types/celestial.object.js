const { dedent } = require('ne-tag-fns')
const gql = dedent

let celestialObject = {
  name: 'CelestialObject',
  schema: gql`
    type CelestialObject {
      hasOrbit: Boolean!
      location: CelestialCoordinate
      name: String!
    }
  `
}

module.exports = {
  celestialObject,
  default: celestialObject
}

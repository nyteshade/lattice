import { dedent as gql } from 'ne-tag-fns'

export celestialObject = {
  name: 'CelestialObject',
  schema: gql`
    type CelestialObject {
      hasOrbit: Boolean!
      location: CelestialCoordinate
      name: String!
    }
  `
}

export default celestialObject

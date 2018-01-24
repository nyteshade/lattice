import { dedent as gql } from 'ne-tag-fns'

export celestialCoordinate = {
  name: 'CelestialCoordinate',
  schema: gql`
    type CelestialCoordinate {
      rightAscension: CelestialAscension
      declination: CelestialDeclination
      constellation: String
      description: String
    }
  `
}

export default celestialCoordinate

const { dedent } = require('ne-tag-fns')
const gql = dedent

let celestialCoordinate = {
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

module.exports = {
  celestialCoordinate,
  default: celestialCoordinate
}

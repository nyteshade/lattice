const { dedent } = require('ne-tag-fns')
const gql = dedent

let celestialAscension = {
  name: 'CelestialAscension',
  schema: gql`
    """
    **CelestialAscension** is also known as right ascension. Its convention
    is to be measured in hours, minutes and seconds. there are 24 hours of
    right ascension (RA) around a circle in the sky.
    """
    type CelestialAscension {
      "The number of hours of right ascension from 0 to 23"
      hours: Float

      "The number of minutes of right ascension from 0 to 59"
      minutes: Float

      "The number of seconds of right ascension from 0 to 59"
      seconds: Float
    }
  `
}

module.exports = {
  celestialAscension,
  default: celestialAscension
}

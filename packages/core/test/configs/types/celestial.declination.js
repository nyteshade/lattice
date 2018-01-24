import { dedent as gql } from 'ne-tag-fns'

export celestialDeclination = {
  name: 'CelestialDeclination',
  schema: gql`
    """
    **CelestialDeclination** is usually written as +27.4° or something
    of that nature. An additional notes field is present to allow further
    description of the declination should any ambiguity arise.
    """
    type CelestialDeclination {
      "An optional field in which to quell any ambiguity"
      notes: String

      "A required field of plus/minus degrees of declination"
      degrees: Float!

      "One degree is divided into 60 arc minutes"
      arcMinutes: Float

      """
      One arc minute is divided into 60 arc seconds making 3600 arcseconds
      in one degree
      """
      arcSeconds: Float
    }

    type Query {
      """
      The mathmatical conversion from a number like -16.716 degrees into
      a celestial declination of -16 degrees, 42 arc minutes and 58 arc
      seconds can be performed by querying \`fromDegrees\` with the
      floating point number.
      """
      fromDegrees(degrees: Float!): CelestialDeclination
    }
  `,
  queries: {
    fromDegrees(root, { degrees }, context, info) {
      let deg = parseInt(degrees, 10)
      let min = Math.abs(degrees - deg) * 60
      let sec = (min - parseInt(min, 10)) * 60

      return {
        degrees: deg,
        arcMinutes: parseInt(min, 10),
        arcSeconds: Math.round(sec)
      }
    }
  }
}

export default celestialDeclination

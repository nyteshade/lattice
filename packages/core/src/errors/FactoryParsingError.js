/**
 * @module Core
 * @flow
 */

import { LatticeBaseError } from './LatticeBaseError'

/**
 * The FactoryParsingError occurs whenever an issue arises during the
 * processing of a given Lattice config object.
 *
 * @class Core.FactoryParsingError
 * @since 3.0.0
 */
export class FactoryParsingError extends LatticeBaseError { }

export default FactoryParsingError

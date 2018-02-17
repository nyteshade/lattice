import { factory } from './factory'
import { ConfigParser } from './ConfigParser'
import { SyntaxTree } from './SyntaxTree'
import {
  implementsLatticeSDLConfig,
  isTypeConfig,
  isInterfaceConfig,
  isUnionConfig,
  isScalarConfig,
  representsType
} from './language'
import types, { typeOf } from 'ne-types'

// TODO refactor utils.js
import { LatticeLogs } from './utils'

export {
  LatticeLogs,
  ConfigParser,
  SyntaxTree,
  factory,
  implementsLatticeSDLConfig,
  isInterfaceConfig,
  isScalarConfig,
  isTypeConfig,
  isUnionConfig,
  representsType,
  typeOf,
  types
}

export default factory

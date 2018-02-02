import { factory } from './factory'
import { ModuleParser } from './ModuleParser'
import { SyntaxTree } from './SyntaxTree'
import {
  implementsLatticeSDLConfig,
  isTypeConfig,
  isInterfaceConfig,
  isUnionConfig,
  isScalarConfig,
  representsType
} from './language'
import types, { typeOf } from './types'

// TODO refactor utils.js
import { LatticeLogs } from './utils'

export {
  LatticeLogs,
  ModuleParser,
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

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.types = exports.typeOf = exports.SyntaxTree = exports.LatticeLogs = exports.factory = undefined;

var _factory = require('./factory');

var _SyntaxTree = require('./SyntaxTree');

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.factory = _factory.factory;
exports.LatticeLogs = _utils.LatticeLogs;
exports.SyntaxTree = _SyntaxTree.SyntaxTree;
exports.typeOf = _types.typeOf;
exports.types = _types2.default;

// TODO refactor utils.js

exports.default = _factory.factory;
//# sourceMappingURL=index.js.map
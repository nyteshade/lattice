'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.factory = factory;

var _SyntaxTree = require('./SyntaxTree');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// What's missing
// concrete testing for interfaces, enums, unions and scalars
// ability to discern these types from config objects, hopefully
//   without the need to specify [type]
// all the specification of [type] even if a config seems like
// its something else
function factory(configs) {
  let cfgs = Array.isArray(configs) ? configs : [configs];
  let tree = _SyntaxTree.SyntaxTree.EmptyDocument();
  let map = {};
  let schema;

  for (let config of cfgs) {
    map[config.name] = config;
    tree.appendDefinitions(config.schema);
  }

  try {
    schema = tree.schema;

    let scalars = 'Int|Float|String|Boolean|ID';
    let gqlTypes = '(__\\w+)|Object|Enum|Union|Interface';
    let rootTypes = 'Query|Mutation|Subscription';
    let filter = new RegExp(`${gqlTypes}|${scalars}|${rootTypes}`);

    // We filter out the Query, Mutation and Subscription items from
    // the ._typeMap names in the case that some clever programmer
    // decides to rename them. They are then picked up here and
    // processed separately.
    let queryType = schema._queryType;
    let mutationType = schema._mutationType;
    let subscriptionType = schema._subscriptionType;

    let remainingTypes = (0, _keys2.default)(schema._typeMap).filter(i => !filter.test(i));

    for (let typeKey of remainingTypes) {
      let type = schema._typeMap[typeKey];

      if (type && type.name && map[type.name] && map[type.name].fields) {
        for (let field of (0, _keys2.default)(map[type.name].fields)) {
          type._fields[field].resolve = map[type.name].fields[field];
        }
      }

      for (let [execType, configKey] of [[queryType, 'queries'], [mutationType, 'mutations'], [subscriptionType, 'subscriptions']]) {
        if (!execType || !map[type.name] || !map[type.name][configKey]) continue;

        for (let field of (0, _keys2.default)(map[type.name][configKey])) {
          let fn = map[type.name][configKey][field];
          execType._fields[field].resolve = fn;
        }
      }
    }
  } catch (error) {
    console.error('[EEEEP!]', error.message || 'Unknown Error!');
    console.error(error.stack);
    throw new FactoryParsingError(error);
  }

  return schema;
}
//# sourceMappingURL=factory.js.map
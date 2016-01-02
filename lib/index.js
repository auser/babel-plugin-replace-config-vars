/*eslint-disable no-process-env, no-undef*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var env = process.env.NODE_ENV || 'development';
var defaultConfig = [];

exports['default'] = function (_ref) {
  var t = _ref.types;

  var match = t.buildMatchMemberExpression('process.env');
  var configOpts = function configOpts(opts) {
    var extraCfg = opts.extra && opts.extra.config ? opts.extra.config : {};
    return defaultConfig.concat(extraCfg);
  };

  var requireConfig = function requireConfig(filepath) {
    return require(filepath);
  };

  var buildStringConfig = function buildStringConfig(filePath) {
    try {
      var stat = _fs2['default'].statSync(filePath);
      if (stat.isFile()) {
        return requireConfig(_path2['default'].resolve(filePath));
      }
    } catch (e) {
      return {};
    }
    return {};
  };

  var buildConfig = function buildConfig(opts) {
    var confOpts = configOpts(opts);
    return confOpts.reduce(function (memo, item) {
      var cfg = memo;
      switch (typeof item) {
        case 'string':
          var newStr = item.replace(/\$ENV/, env);
          Object.assign(cfg, buildStringConfig(newStr));
          break;
        case 'object':
          if (item[env]) {
            Object.assign(cfg, item[env]);
          }
          break;
        default:
          break;
      }
      return cfg;
    }, {});
  };

  return new Plugin('replace-config-vars', {
    visitor: {
      Program: function Program(node, parent, scope, file) {
        // Set debugging
        var config = buildConfig(file.opts);
        file.set('config', config);
      },

      MemberExpression: function MemberExpression(node, parent, scope, state) {
        if (match(node.object)) {
          var processEnv = undefined;
          if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
            processEnv = process.env;
          }
          var cfg = state.get('config');
          var key = this.toComputedKey();
          var k = key.value.toUpperCase();
          if (cfg[k] || process.env[k]) {
            var value = cfg[k] || processEnv[k];
            return t.valueToNode(value);
          }
        }
      }
    }
  });
};

module.exports = exports['default'];
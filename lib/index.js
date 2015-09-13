'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var DEBUG_INTRO = 'Babel plugin config: ';
var env = process.env.NODE_ENV || 'development';
var defaultConfig = {
  'directory': './config',
  'debug': false
};

exports['default'] = function (_ref) {
  var Plugin = _ref.Plugin;
  var t = _ref.types;

  var match = t.buildMatchMemberExpression('process.env');
  var configOpts = function configOpts(opts) {
    return opts.extra && opts.extra.config ? opts.extra.config : defaultConfig;
  };

  return new Plugin('replace-config-vars', {
    visitor: {
      Program: function Program(node, parent, scope, file) {
        // Set debugging
        var cfg = configOpts(file.opts);
        var debugging = cfg.debug || false;
        var dir = cfg.directory;

        file.set('debugging', debugging);

        var resolvedDir = _path2['default'].resolve(dir);
        var confFile = _path2['default'].join(resolvedDir, env + '.json');

        // Check if file exists

        if (debugging) console.log(DEBUG_INTRO, 'Attempting to load config file: ' + confFile);

        var conf = cfg;
        try {
          var stat = _fs2['default'].statSync(confFile);
          if (stat.isFile()) {
            conf = require(confFile);
            if (debugging) console.log(DEBUG_INTRO, 'Loaded config file:', confFile);
          }
        } catch (e) {
          if (e.code !== 'ENOENT') throw new Error(e);

          if (debugging) console.log(DEBUG_INTRO, 'Error loading config file', e);
        }

        file.set('config', conf);
      },

      MemberExpression: function MemberExpression(node, parent, scope, state) {
        var debugging = state.get('debugging');

        if (match(node.object)) {
          var cfg = state.get('config');
          var key = this.toComputedKey();
          var k = key.value.toUpperCase();
          if (cfg[k] || process.env[k]) {
            var value = cfg[k] || process.env[k];

            if (debugging) console.log(DEBUG_INTRO, 'Setting ', k, 'to', value);
            return t.valueToNode(value);
          }
        }
      }
    }
  });
};

module.exports = exports['default'];

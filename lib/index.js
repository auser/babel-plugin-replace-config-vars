'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var fs = require('fs'),
    path = require('path');

var DEBUG_INTRO = 'Babel plugin config: ';
var env = process.env.NODE_ENV || 'development';
var defaultConfig = {
  "directory": "./config"
};

exports['default'] = function (_ref) {
  var Plugin = _ref.Plugin;
  var t = _ref.types;

  var match = t.buildMatchMemberExpression("process.env");
  var configOpts = function configOpts(opts) {
    return opts.extra && opts.extra.config ? opts.extra.config : defaultConfig;
  };
  var directoryDefined = function directoryDefined(opts) {
    return opts.extra && opts.extra.config && opts.extra.config.directory;
  };
  var defaultDirectory = './config';

  return new Plugin("replace-config-vars", {
    visitor: {
      Program: function Program(node, parent, scope, file) {
        // Set debugging
        var debugging = configOpts.debug ? configOpts.debug : false;
        file.set("debugging", debugging);

        var dir = directoryDefined(file.opts) ? file.opts.extra.config.directory : defaultDirectory;

        var resolvedDir = path.resolve(dir);
        var confFile = path.join(resolvedDir, env + '.json');
        var conf = {};

        // Check if file exists

        debugging && console.log(DEBUG_INTRO, "Attempting to load config file: " + confFile);

        try {
          var stat = fs.statSync(confFile);
          if (stat.isFile()) {
            conf = require(confFile);
            debugging && console.log(DEBUG_INTRO, "Loaded config file:", confFile);
          }
        } catch (e) {
          if (e.code !== 'ENOENT') throw new Error(e);

          debugging && console.log(DEBUG_INTRO, "Error loading config file", e);
        }

        file.set("config", conf);
      },

      MemberExpression: function MemberExpression(node, parent, scope, state) {
        var debugging = state.get('debugging');

        if (match(node.object)) {
          var cfg = state.get('config');
          var key = this.toComputedKey();
          if (cfg[key.value]) {
            var value = cfg[key.value];

            debugging && console.log(DEBUG_INTRO, "Setting ", key, "to", value);
            return t.valueToNode(value);
          }
        }
      }
    }
  });
};

module.exports = exports['default'];
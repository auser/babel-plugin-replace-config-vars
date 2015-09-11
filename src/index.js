var fs = require('fs'),
    path = require('path');

const DEBUG_INTRO = 'Babel plugin config: ';
var env = process.env.NODE_ENV || 'development';
const defaultConfig = {
  "directory": "./config"
};

export default function ({ Plugin, types: t }) {
  var match = t.buildMatchMemberExpression("process.env");
  var configOpts       = (opts) => (opts.extra && opts.extra.config) ? opts.extra.config : defaultConfig;
  var directoryDefined = (opts) => opts.extra && opts.extra.config && opts.extra.config.directory;
  var defaultDirectory = './config';

  return new Plugin("replace-config-vars", {
    visitor: {
      Program(node, parent, scope, file) {
        // Set debugging
        let debugging = configOpts.debug ? configOpts.debug : false;
        file.set("debugging", debugging);

        var dir = directoryDefined(file.opts) ?
            file.opts.extra.config.directory : defaultDirectory;

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
          if (e.code !== 'ENOENT')
            throw new Error(e);

          debugging && console.log(DEBUG_INTRO, "Error loading config file",e);
        }

        file.set("config", conf);
      },

      MemberExpression: function(node, parent, scope, state) {
        let debugging = state.get('debugging');

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
}

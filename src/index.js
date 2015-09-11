var fs = require('fs'),
    path = require('path');

const DEBUG_INTRO = 'Babel plugin config: ';
var env = process.env.NODE_ENV || 'development';
var defaultConfig = {
  "directory": "./config",
  "debug": false,
 
export default function ({ Plugin, types: t }) {
  var match = t.buildMatchMemberExpression("process.env");
  var configOpts       = (opts) => (opts.extra && opts.extra.config) ? opts.extra.config : defaultConfig;

  return new Plugin("replace-config-vars", {
    visitor: {
      Program(node, parent, scope, file) {
        // Set debugging
        var cfg       = configOpts(file);
        var debugging = cfg.debug || false;
        var dir       = cfg.directory;

        file.set("debugging", debugging);

        var resolvedDir = path.resolve(dir);
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

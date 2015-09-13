import fs from 'fs';
import path from 'path';

var DEBUG_INTRO = 'Babel plugin config: ';
var env = process.env.NODE_ENV || 'development';
var defaultConfig = {
  'directory': './config',
  'debug': false
};

export default function ({ Plugin, types: t }) {
  var match = t.buildMatchMemberExpression('process.env');
  var configOpts       = (opts) => (opts.extra && opts.extra.config) ? opts.extra.config : defaultConfig;

  return new Plugin('replace-config-vars', {
    visitor: {
      Program(node, parent, scope, file) {
        // Set debugging
        var cfg       = configOpts(file);
        var debugging = cfg.debug || false;
        var dir       = cfg.directory;

        file.set('debugging', debugging);

        var resolvedDir = path.resolve(dir);
        var confFile = path.join(resolvedDir, env + '.json');

        // Check if file exists

        if (debugging)
          console.log(DEBUG_INTRO, 'Attempting to load config file: ' + confFile);

        let conf;
        try {
          var stat = fs.statSync(confFile);
          if (stat.isFile()) {
            conf = require(confFile);
            if (debugging)
              console.log(DEBUG_INTRO, 'Loaded config file:', confFile);
          }
        } catch (e) {
          if (e.code !== 'ENOENT')
            throw new Error(e);

          if (debugging)
            console.log(DEBUG_INTRO, 'Error loading config file',e);
        }

        file.set('config', conf);
      },

      MemberExpression: function(node, parent, scope, state) {
        let debugging = state.get('debugging');

        if (match(node.object)) {
          var cfg = state.get('config');
          var key = this.toComputedKey();
          let k = key.value.toUpperCase();
          if (cfg[k] || process.env[k]) {
            var value = cfg[k] || process.env[k];

            if (debugging)
              console.log(DEBUG_INTRO, 'Setting ', k, 'to', value);
            return t.valueToNode(value);
          }
        }
      }
    }
  });
}

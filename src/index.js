import fs from 'fs';
import path from 'path';
import glob from 'glob';
import objectAssign from 'object-assign';

var DEBUG_INTRO = 'Babel plugin config: ';
var env = process.env.NODE_ENV || 'development';
var defaultConfig = [];

export default function ({ Plugin, types: t }) {
  var match = t.buildMatchMemberExpression('process.env');
  var configOpts       = (opts) => {
    let extraCfg  = (opts.extra && opts.extra.config) ? opts.extra.config : {};
    return defaultConfig.concat(extraCfg);
  }

  const buildStringConfig = (filePath) => {
    try {
      let stat = fs.statSync(filePath);
      if (stat.isFile()) {
        return require(path.resolve(filePath));
      }
    } catch (e) {
      console.log('Error occurred when opening file', e);
    }
    return {};
  }

  const buildConfig = (opts) => {
    let confOpts = configOpts(opts);
    return confOpts.reduce((memo, item) => {
      let cfg = memo;
      switch(typeof item) {
        case 'string':
          let newStr = item.replace(/\$ENV/, env);
          Object.assign(cfg, buildStringConfig(newStr));
          break;
        case 'object':
          if (item[env]) {
            Object.assign(cfg, item[env]);
          }
          break;
        default:
          console.error('Unknown config type');
      }
      return cfg;
    }, {});
  }

  return new Plugin('replace-config-vars', {
    visitor: {
      Program(node, parent, scope, file) {
        // Set debugging
        let config    = buildConfig(file.opts);
        file.set('config', config);
      },

      MemberExpression: function(node, parent, scope, state) {
        if (match(node.object)) {
          var cfg = state.get('config');
          var key = this.toComputedKey();
          let k = key.value.toUpperCase();
          if (cfg[k] || process.env[k]) {
            var value = cfg[k] || process.env[k];
            return t.valueToNode(value);
          }
        }
      }
    }
  });
}

/*eslint-disable no-process-env, no-undef*/

import fs from 'fs';
import path from 'path';

let env = process.env.NODE_ENV || 'development';
let defaultConfig = [];

export default function ({ Plugin, types: t }) {
  let match = t.buildMatchMemberExpression('process.env');
  let configOpts       = (opts) => {
    let extraCfg  = (opts.extra && opts.extra.config) ? opts.extra.config : {};
    return defaultConfig.concat(extraCfg);
  };

  const requireConfig = (filepath) => require(filepath);

  const buildStringConfig = (filePath) => {
    try {
      let stat = fs.statSync(filePath);
      if (stat.isFile()) {
        return requireConfig(path.resolve(filePath));
      }
    } catch (e) {
      return {};
    }
    return {};
  };

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
        break;
      }
      return cfg;
    }, {});
  };

  return new Plugin('replace-config-vars', {
    visitor: {
      Program(node, parent, scope, file) {
        // Set debugging
        let config    = buildConfig(file.opts);
        file.set('config', config);
      },

      MemberExpression: function(node, parent, scope, state) {
        if (match(node.object)) {
          let processEnv;
          if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
            processEnv = process.env;
          }
          let cfg = state.get('config');
          let key = this.toComputedKey();
          let k = key.value.toUpperCase();
          if (cfg[k] || process.env[k]) {
            let value = cfg[k] || processEnv[k];
            return t.valueToNode(value);
          }
        }
      }
    }
  });
}

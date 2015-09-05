var fs = require('fs'),
    path = require('path');

var env = process.env.NODE_ENV || 'development';

export default function ({ Plugin, types: t }) {
  var match = t.buildMatchMemberExpression("process.env");
  var directoryDefined = (opts) => opts.extra && opts.extra.config && opts.extra.config.directory;
  var defaultDirectory = './config';

  return new Plugin("replace-config-vars", {
    visitor: {
      Program(node, parent, scope, file) {
        // console.log('node ->', file);
        var dir = directoryDefined(file.opts) ?
            file.opts.extra.config.directory : defaultDirectory;

        var resolvedDir = path.resolve(dir);
        var confFile = path.join(resolvedDir, env + '.json');
        var conf = {};

        // Check if file exists
        try {
          var stat = fs.statSync(confFile);
          if (stat.isFile())
            conf = require(confFile);
        } catch (e) {
          if (e.code !== 'ENOENT')
            throw new Error(e);
        }

        file.set("config", conf);
      },

      MemberExpression: function(node, parent, scope, state) {
        if (match(node.object)) {
          var cfg = state.get('config');
          var key = this.toComputedKey();
          if (cfg[key.value]) {
          var value = cfg[key.value];
            return t.valueToNode(value);
          }
        }
      }

      // Scopable(node, parent, scope, file) {
      //   for (var name in this.scope.bindings) {
      //     console.log('name --->', this.scope.globals);
      //     // this.scope.rename(name, toEmoji(name, file.get("emojificationMap")));
      //   }
      // },
      // MemberExpression(node, parent, scope, state) {
      //   var prop = node.property;
      //   if (t.isIdentifier(node.object) && node.object.name === 'process') {
      //     // if (node.computed && )
      //     var isMemberExpression = t.isMemberExpression({computed: false});
      //     var callee = this.get('callee');

      //     console.log('env ->',
      //                 isMemberExpression,
      //                 callee,
      //                 this.traverse(node.property)
      //                 // t.toExpression(node),
      //                 // t.memberExpression(node)
      //                );

      //     //   if (node.property.name === 'env') {
      //     //     var property = node.property;
      //     //     console.log('replace ->', property, property.name);
      //     //   }
      //     //     var property = node.property;
      //     //     var defines = state.opts.extra.defines;
      //     //     if (t.isIdentifier(property) && defines[property.name] !== undefined) {
      //     //       return t.valueToNode(state.opts.extra.defines[property.name]);
      //   }
      // }
    }
  });
}

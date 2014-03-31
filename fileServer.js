
WebApp.connectHandlers.stack.splice (0, 0, {
  route: '/modules', // TODO: make it configurable
  handle: Meteor.bindEnvironment(function(req, res, next) {
    
    var path = req.url.match(/[^?]*/)[0];
        name = path.split('/').slice(1).join('/'),
        text = "",
        done = false,
        deps = [];

    moduleManager.forEach(name, function (module, moduleName) {
      text += 'define("' + moduleName + '", ["' + module.deps.join('", "') + '"], ' + module.body.toString() + ');\n';
      done = done || (moduleName === name);
      deps.push(moduleName);
    });

    if (text.length > 0) {

      if (!done) {
        text += 'define("' + name + '", [\n"' + deps.join('",\n"') + '"\n], function () {});\n';
      }

      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end(text);

    } else {

      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('module "' + name + '" not found');

    }

  }),

});


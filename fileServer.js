Router.map(function () {

  this.route('modules', {
    path  : '/modules/:name?',
    where : 'server',

    action : function () {
      var name = this.params.name || "",
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

        this.response.writeHead(200, {'Content-Type': 'text/javascript'});
        this.response.end(text);

      } else {

        this.response.writeHead(404, {'Content-Type': 'text/plain'});
        this.response.end('module "' + name + '" not found');

      }
    },
  });

});

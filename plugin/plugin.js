
var path = Npm.require('path');

Plugin.registerSourceHandler('module.json', function (compileStep) {

  var isBrowser = compileStep.arch.match(/^browser(\.|$)/);
  var config = JSON.parse(compileStep.read().toString('utf8'));
  var contents = '';
  var moduleName = config.name;

  if (!moduleName) {
    // TODO: throw error
  }

  _.each(config.plugins, function (name) {
    contents += 'Module(' + JSON.stringify(moduleName) + ').usePlugin(' + JSON.stringify(name) + ');\n';
  });

  compileStep.addJavaScript({
    path       : compileStep.inputPath,
    sourcePath : compileStep.inputPath,
    data       : contents,
    bare       : isBrowser,
  });

});

Plugin.registerSourceHandler('module.js', function (compileStep) {

  var options = parseModuleOptions(compileStep);
  var isBrowser = compileStep.arch.match(/^browser(\.|$)/);
  var isModuleJs = path.basename(compileStep.inputPath) === 'module.js';

  if (!options.module) {
    // TODO: use compileStep.error instead of throwing excpetion
    throw Error('Cannot figure out module name for ' + compileStep.inputPath);
  }

  var contents = compileStep.read().toString('utf8');

  if (!isModuleJs) {
    if (!options.layer) {
      contents = "Module('" + options.module + "').extend(function (" + getFactoryArgsString(options.module) + ") {" + contents + "});";
    } else {
      if (isBrowser) {
        // on browser, only register this layer
        contents = "Module('" + options.module + "').layer('" + options.layer + "');";
      } else {
        contents = "Module('" + options.module + "').layer('" + options.layer + "').extend(function (" + getFactoryArgsString(options.module) + ") {" + contents + "});";
      }
    }
  }

  compileStep.addJavaScript({
    path       : compileStep.inputPath, // what is this for?
    sourcePath : compileStep.inputPath,
    data       : contents,
    bare       : !isModuleJs && isBrowser,
  });

});

Plugin.registerSourceHandler("module.html", {isTemplate: true}, function (compileStep) {
  //if (compileStep.arch.match(/^browser(\.|$)/))
  //  return;

  var options = parseModuleOptions(compileStep);

  if (!options.module) {
    // TODO: use compileStep.error instead of throwing excpetion
    throw Error('Cannot figure out module name for ' + compileStep.inputPath);
  }

  var contents = compileStep.read().toString('utf8');

  try {
    var results = html_scanner.scan(contents, compileStep.inputPath, options);
  } catch (e) {
    if (e instanceof html_scanner.ParseError) {
      compileStep.error({
        message: e.message,
        sourcePath: compileStep.inputPath,
        line: e.line
      });
      return;
    } else
      throw e;
  }

  // XXX we ignore here results.head and .body

  if (results.js) {
    // TODO: raname to template.[name].js
    compileStep.addJavaScript({
      path       : compileStep.inputPath,
      sourcePath : compileStep.inputPath,
      data       : results.js,
    });
  }
});

function parseModuleOptions(compileStep) {
  var parts, index, regExp = new RegExp('\\.module\\' + path.extname(compileStep.inputPath) + '$');

  var options = {
    path: compileStep.inputPath
  };

  if (compileStep.fileOptions.module) {
    options.module = compileStep.fileOptions.module;
  }

  if (compileStep.fileOptions.layer) {
    options.layer = compileStep.fileOptions.layer;
  }

  if (!options.module && compileStep.packageName) {
    options.module = compileStep.packageName;
  }

  if (!options.module) {
    parts = compileStep.inputPath.split(path.sep);
    index = _.indexOf(parts, 'modules');
    if (index < 0 || index === parts.length - 1) {
      options.module = parts[parts.length - 1].replace(regExp, '');
    } else {
      options.module = parts[index + 1].replace(regExp, '');
    }
  }

  if (!options.layer) {
    parts = compileStep.inputPath.split(path.sep);
    index = _.indexOf(parts, 'layers');
    if (index >= 0 && index < parts.length - 1) {
      options.layer = parts[index + 1].replace(regExp, '');
    }
  }

  return options;
}


var path = Npm.require('path');

Plugin.registerSourceHandler('module.js', function (compileStep) {

  var options = parseModuleOptions(compileStep);

  if (!options.module) {
    throw Error('Cannot figure out module name for ' + compileStep.inputPath);
  }

  var weAreOnTheServer = !compileStep.arch.match(/^browser(\.|$)/);
  var contents = compileStep.read().toString('utf8');

  if (!options.layer) {
    contents = "\n\nModule('" + options.module + "').extend(function (" + toCamelCase(options.module) + ", settings, i18n, require) {\n\n" +
      contents + "\n\n" +
    "});\n";
  } else {
    // TODO: lazy loading
    return;
  }

  compileStep.addJavaScript({
    path       : compileStep.inputPath, // what is this for?
    sourcePath : compileStep.inputPath,
    data       : contents
  });

});

function toCamelCase(name) {
  return name.replace(/(^|[^a-zA-Z])[a-z]/g, function (match) {
    return match[match.length - 1].toUpperCase();
  });
}

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


var path = Npm.require('path');
var moduleExt = 'module.js';

var parseModuleName = function (relPath) {
  var parts = relPath.split(path.sep);
  var index = _.indexOf(parts, 'modules');
  if (index < 0 || index === parts.length - 1) {
    name = parts[parts.length - 1];
  } else {
    name = parts[index+1];
  }
  return name.slice(0, name.length - (moduleExt.length + 1));
};

var camel = function (name) {
  return name.replace(/(^|[^a-zA-Z])[a-z]/g, function (match) {
    return match[match.length - 1].toUpperCase();
  });
}

Plugin.registerSourceHandler(moduleExt, function (compileStep) {

  console.log('COMPILE STEP');
  console.log(compileStep);

  if (compileStep.packageName) {
    
  }

  var weAreOnTheServer = !compileStep.arch.match(/^browser(\.|$)/);

  if (!weAreOnTheServer)
    return;

  var contents = compileStep.read().toString('utf8');

  // XXX we could do better than this
  var name = parseModuleName(compileStep.inputPath);

  //contents = 'define("' + compileStep.inputPath + '", [], function () {\n' + contents + '\n});';

  contents = "\n\nModule('" + name + "').extend(function (" + camel(name) + ", settings, i18n, require) {\n\n" +
    contents + "\n\n" +
  "});\n";

  compileStep.addJavaScript({
    path       : compileStep.inputPath, // what is this for?
    sourcePath : compileStep.inputPath,
    data       : contents
  });

});

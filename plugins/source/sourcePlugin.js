
Plugin.registerSourceHandler("module.js", function (compileStep) {

  var weAreOnTheServer = !compileStep.arch.match(/^browser(\.|$)/);

  if (!weAreOnTheServer)
    return;

  var contents = compileStep.read().toString('utf8');

  contents = 'define("' + compileStep.inputPath + '", [], function () {\n' + contents + '\n});';

  compileStep.addJavaScript({
    path       : compileStep.inputPath, // what is this for?
    sourcePath : compileStep.inputPath,
    data       : contents
  });

});

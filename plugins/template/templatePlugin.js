
Plugin.registerSourceHandler("module.html", function (compileStep) {
  if (compileStep.arch.match(/^browser(\.|$)/))
    return;

  var contents = compileStep.read().toString('utf8');
  try {
    var results = html_scanner.scan(contents, compileStep.inputPath);
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

    compileStep.addJavaScript({
      path       : compileStep.inputPath,
      sourcePath : compileStep.inputPath,
      data       : 'define("' + compileStep.inputPath + '", [], function () {\n' + results.js + '\n});',
    });
  }
});

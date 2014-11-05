
var path = Npm.require('path');
var sourcemap = Npm.require('source-map');
var webRegExp = /^web(\.|$)/;

Plugin.registerSourceHandler('module.json', function (compileStep) {

  var options = parseModuleOptions(compileStep);
  var isBrowser = webRegExp.test(compileStep.arch);
  var config = JSON.parse(compileStep.read().toString('utf8'));
  var contents = '';
  var moduleName = options.module;

  if (config.name) {
    if (options.name === '$global') {
      moduleName = config.name;
    } else if (config.name !== options.module) {
      throw new Error('module name mismatch');
    }
  }

  contents += 'Module(' + JSON.stringify(moduleName) + ').configure(' + JSON.stringify(config, undefined, 2) + ');\n';

  compileStep.addJavaScript({
    path       : compileStep.inputPath,
    sourcePath : compileStep.inputPath,
    data       : contents,
    bare       : isBrowser,
  });

});

Plugin.registerSourceHandler('module.js', function (compileStep) {

  var options = parseModuleOptions(compileStep);
  var isBrowser = webRegExp.test(compileStep.arch);
  var isModuleJs = path.basename(compileStep.inputPath) === 'module.js';

  if (!options.module) {
    // TODO: use compileStep.error instead of throwing excpetion
    throw Error('Cannot figure out module name for ' + compileStep.inputPath);
  }

  var contents = compileStep.read().toString('utf8');
  var chunks = [];

  if (isModuleJs) {
    compileStep.addJavaScript({
      path       : compileStep.inputPath, // what is this for?
      sourcePath : compileStep.inputPath,
      data       : contents,
      bare       : isBrowser,
    });
    return;
  }

  if (!options.layer) {
    chunks.push("Module('" + options.module + "').extend(function (" + getFactoryArgsString(options.module) + ") {\n\n");
  } else {
    if (isBrowser) {
      // on browser, only register this layer
      chunks.push("Module('" + options.module + "').layer('" + options.layer + "');");
    } else {
      chunks.push("Module('" + options.module + "').layer('" + options.layer + "').extend(function (" + getFactoryArgsString(options.module) + ") {\n\n");
    }
  }

  if (!options.layer || !isBrowser) {

    numberifyLines(contents, function (line, suffix, num) {
      chunks.push(new sourcemap.SourceNode(num, 0, compileStep.pathForSourceMap, line));
      chunks.push(suffix);
    });

    chunks.push("\n});");
  }

  // finally generate source map

  var node = new sourcemap.SourceNode(null, null, null, chunks);
  var results = node.toStringWithSourceMap({
    file: compileStep.pathForSourceMap
  });

  compileStep.addJavaScript({
    path       : compileStep.inputPath, // what is this for?
    sourcePath : compileStep.inputPath,
    data       : results.code,
    sourceMap  : results.map.toString(),
    bare       : isBrowser
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

var width = 80;
var padding = Array(width + 1).join(' ');

var numberifyLines = function (source, f) {
  var num = 1;
  var lines = source.split('\n');
  _.each(lines, function (line) {
    var suffix = "\n";

    if (line.length <= width && line[line.length - 1] !== "\\") {
      suffix = padding.slice(line.length, width) + " // " + num + "\n";
    }
    f(line, suffix, num);
    num++;
  });
};

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

  if (!options.layer) {
    parts = compileStep.inputPath.split(path.sep);
    index = _.indexOf(parts, 'layers');
    if (index >= 0 && index < parts.length - 1) {
      options.layer = parts[index + 1].replace(regExp, '');
    }
  }

  if (!options.module) {
    parts = compileStep.inputPath.split(path.sep);
    index = _.indexOf(parts, 'modules');
    if (index >= 0 && index < parts.length - 1) {
      options.module = parts[index + 1].replace(regExp, '');
    } else if (!options.layer) {
      options.module = parts[parts.length - 1].replace(regExp, '');
    }
  }

  if (!options.module) {
    options.module = '$global';
  }

  return options;
}

Package.describe({
  name:     "anti:modules",
  version:  "0.1.7",
  summary:  "A lightweight module manager for Meteor",
  git:      "https://github.com/anticoders/meteor-modules.git",
});

Package._transitional_registerBuildPlugin({
  name: 'compileImpactModules',
  use: [ 'spacebars-compiler', 'underscore' ],
  sources: [
    'utils.js',
    'build_plugin/html_scanner.js', // this is copy/pasted from meteor
    'build_plugin/plugin.js',
  ]
});

// TODO: add wek dependency to iron:router

Npm.depends({
  'source-map': '0.1.40'
});

Package.on_use(function (api) {
  api.versionsFrom('1.0');
  api.use(['deps', 'underscore', 'blaze', 'webapp'], ['client', 'server']);
  api.use('amd:manager@0.0.5', ['client', 'server']);

  api.add_files([
    'utils.js',
    'require.js',
    'moduleFactory.js',
    'manager.js',
    'moduleTool.js',
    'index.js',

    // PLUGINS

    'plugins/instance.js',
    'plugins/ready.js',
    'plugins/template.js',
  ]);

  api.add_files([
    'fileServer.js'
  ], 'server');

  api.export('Module');
});

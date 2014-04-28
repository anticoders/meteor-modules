Package.describe({
  summary: "A lightweight module manager for Meteor",
});

Package._transitional_registerBuildPlugin({
  name: 'compileSourceCodeForModules',
  use: [],
  sources: [
    'plugins/source/sourcePlugin.js',
  ]
});

Package._transitional_registerBuildPlugin({
  name: 'compileTemplatesForModules',
  use: [ 'spacebars-compiler' ],
  sources: [
    'plugins/template/html_scanner.js', // this is copy/pasted from meteor
    'plugins/template/templatePlugin.js',
  ]
});

Package.on_use(function (api) {
  api.use(['deps', 'underscore', 'templating', 'webapp'], ['client', 'server']);

  api.add_files([
    'manager.js',
    'require.js',
    'i18n.js',
    'module.js',
  ]);

  api.add_files([
    'fileServer.js'
  ], 'server');

  api.export('require');
  api.export('define');
  api.export('module');
});

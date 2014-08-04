Package.describe({
  summary: "A lightweight module manager for Meteor",
});

Package._transitional_registerBuildPlugin({
  name: 'compileImpactModules',
  use: [ 'spacebars-compiler', 'underscore' ],
  sources: [
    'utils.js',
    'plugin/html_scanner.js', // this is copy/pasted from meteor
    'plugin/plugin.js',
  ]
});

Package.on_use(function (api) {
  api.use(['deps', 'underscore', 'templating', 'webapp', 'amd-manager'], ['client', 'server']);

  api.add_files([
    'utils.js',
    'require.js',
    'i18n.js',
    'module.js',
    'publicAPI.js',
  ]);

  api.add_files([
    'fileServer.js'
  ], 'server');

  api.export('Module');
});

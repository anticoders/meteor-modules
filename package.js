Package.describe({
  summary: "A lightweight module manager for Meteor",
});

Package._transitional_registerBuildPlugin({
  name: 'compileImpactModules',
  use: [ 'spacebars-compiler', 'underscore' ],
  sources: [
    'plugin/html_scanner.js', // this is copy/pasted from meteor
    'plugin/plugin.js',
  ]
});

Package.on_use(function (api) {
  api.use(['deps', 'underscore', 'templating', 'webapp', 'amd-manager'], ['client', 'server']);

  api.add_files([
    'require.js',
    'i18n.js',
    'moduleAPI.js',
  ]);

  api.add_files([
    'fileServer.js'
  ], 'server');

  api.export('Module');
});

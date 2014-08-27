Package.describe({
  name:     "anticoders:modules",
  version:  "0.1.3",
  summary:  "A lightweight module manager for Meteor",
  git:      "https://github.com/anticoders/meteor-modules.git",
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
  api.versionsFrom('0.9.0');
  api.use(['deps', 'underscore', 'templating', 'webapp', 'apendua:amd-manager'], ['client', 'server']);

  api.add_files([
    'utils.js',
    'require.js',
    'i18n.js',
    'module.js',
    'methods.js',

    // PLUGINS

    'plugins.js',
    'template.js',
    'livedata.js',
    'router.js',
  ]);

  api.add_files([
    'fileServer.js'
  ], 'server');

  api.export('Module');
});

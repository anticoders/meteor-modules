
Package.describe({
  summary: "Example module",
  version: "0.0.0",
});

Package.on_use(function (api) {
  api.use(['anti:modules', 'underscore'], ['client', 'server']);
  
  api.add_files([

    // LAYERS

    'layers/layer1.module.js',
    'layers/layer2.module.js',

    // CONFIG

    'configure.module.js',

  ], ['client', 'server'], { });

});

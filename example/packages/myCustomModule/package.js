
Package.describe({
  summary: "Example module",
});

Package.on_use(function (api) {
  api.use(['modules', 'underscore'], ['client', 'server']);
  
  api.add_files([


  ])

  api.add_files([

    // LAYERS

    'layers/layer1.module.js',
    'layers/layer2.module.js',

    // CONFIG

    'configure.module.js',

  ], ['client', 'server'], { });

});

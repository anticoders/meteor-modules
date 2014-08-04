
Module.registerPlugin('router', [ '$module' ], function ($module) {
  $module.addToRecipies(function (instance) {
    instance.router = {};
  });
});

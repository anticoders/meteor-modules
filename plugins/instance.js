
Module.registerPlugin('$instance', [ '$module' ], function ($module) {
  $module.addToRecipies(function (instance) {
    instance.define('$instance', function () {
      return instance;
    });
  });
});

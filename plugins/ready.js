
Module.registerPlugin('$ready', [ '$module' ], function ($module) {
  var readyDependency = new Deps.Dependency();
  var isReady = false;

  $module.addToRecipies(function (instance) {
    instance.ready = function () {
      readyDependency.depend();
      return isReady;
    }
  });

  Meteor.defer(function () { // to prevent circular dependencies

    $module.require('$config', function ($config) {
      $module.require($module.plugins.concat($config.plugins), function () {
        isReady = true;
        readyDependency.changed();
      });
    });

  });
});

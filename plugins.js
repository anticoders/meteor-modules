
Module.registerPlugin('$template', [ '$module' ], function ($module) {
  console.log('adding $template recipie')
  $module.addToRecipies(function (instance) {
    var _Template = function Template () {};
    if (typeof Template !== 'undefined') {
      _Template.prototype = Object.create(Template.prototype);
      _Template.prototype.constructor = _Template;
    }
    console.log('adding Template to', instance.settings.__name__);
    instance.Template = { prototype: _Template.prototype };
  });
});

Module.registerPlugin('$instance', [ '$module' ], function ($module) {
  $module.addToRecipies(function (instance) {
    instance.define('$instance', function () {
      return instance;
    });
  });
});

Module.registerPlugin('$ready', [ '$module' ], function ($module) {
  var readyDependency = new Deps.Dependency();
  var isReady = false;

  $module.addToRecipies(function (instance) {
    instance.ready = function () {
      readyDependency.depend();
      return isReady;
    }
  });

  Meteor.defer(function () {

    $module.require('$config', function ($config) {
      $module.require($module.plugins.concat($config.plugins), function () {
        isReady = true;
        readyDependency.changed();
      });
    });

  });
});

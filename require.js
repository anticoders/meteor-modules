
Meteor.modules = new Meteor.Collection('modules');

var useAjax = false;

moduleManager = new AMDManager({
  moduleNotPresent: function (object) {
    if (!useAjax) return;
    if (object.ajax === undefined) { // make sure we do it only once
      object.ajax = true;
      $.ajax({
        url  : '/modules/' + object.name,
        type : 'GET', dataType : 'script',
      }).done(function (message) {});
    }
  },
});

require = function (deps, body) {
  // TODO: implement as reactive data source when no body provided
  var isReady = false,
      dependency = new Deps.Dependency();

  if (_.isString(deps)) {
    deps = [deps, ];
  }
  if (!_.isFunction(body)) {
    body = function () {};
  }

  moduleManager.require(deps, function () {
    body.apply(this, arguments);
    isReady = true;
    dependency.changed();
  });

  // TODO: in general we don't want to return the wait API but the requested module
  return {
    ready: function () {
      dependency.depend();
      return isReady;
    }
  };
};

define = function (name, deps, body) {
  moduleManager.define(name, deps, body); 
  // just an experiment
  Meteor.modules.insert({
    name  : name,
    deps  : deps,
    where : Meteor.isServer ? 'server' : 'client',
  });
};

define.amd = true;

if (Meteor.isServer) {
  Meteor.modules.remove({}); // make this more safe
}

define('', [], function () {}); // sentinel, every module with no deps depends on it ;)

if (Meteor.isClient) {

  Meteor.startup(function () {
    useAjax = true;
  });

}

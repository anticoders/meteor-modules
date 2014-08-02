
wrapRequire = function (manager) {
  var requireDeps = {};
  return function require (listOrName, body) {
    var dependency, isReady = false;
    if (_.isFunction(body)) {
      if (!_.isArray(listOrName)) {
        listOrName = [listOrName, ];
      }
      return manager.require(listOrName, body);
    } else {
      if (_.isArray(listOrName)) {
        dependency = new Deps.Dependency();
        manager.require(listOrName, function () {
          dependency.changed();
          isReady = true;
        });
        return {
          ready: function () {
            dependency.depend();
            return !!isReady;
          },
        }; // ready handle
      } else if (_.isString(listOrName)) {
        if (requireDeps[listOrName] === undefined) {
          requireDeps[listOrName] = new Deps.Dependency();
          manager.require([listOrName, ], function () {
            requireDeps[listOrName].changed();
          });
        }
        requireDeps[listOrName].depend();
        return manager.get(listOrName);
      }
    }

    // TODO: be more specific
    throw new Error('Wrong parameters for require.');
  };
};

wrapDefine = function (manager) {
  return function define (name, deps, body) {
    if (arguments.length == 2) {
      body = deps; deps = [];
    }
    manager.define(name, deps, body);
  };
};

/*
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
*/

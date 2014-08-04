
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


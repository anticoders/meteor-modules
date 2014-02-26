
AMDManager = function (options) {

  // TODO: better implementation
  // TODO: better API
  // TODO: error checking

  var manager = this,
      moduleNotPresent,
      objects = {},
      listOfObjects = [];

  // parse options
  options = options || {};
  moduleNotPresent = options.moduleNotPresent || function () {};

  var getOrCreate = function (name) {
    return objects[name] = objects[name] || { name : name, call : [] };
  };

  manager.get = function (name) { return objects[name]; };

  manager.forEach = function (prefix, callback) {
    var regexp = new RegExp(prefix);
    _.each(listOfObjects, function (object) {
      if (_.has(object, 'body') && regexp.test(object.name)) {
        callback.call({}, object, object.name);
      }
    });
  }

  manager.load = function (object, action) { // action can be undefined
    if (_.has(object, 'data')) {
      if (_.isFunction(action))
        action.call(undefined, object.data);
    } else {
      if (_.isFunction(action)) {
        object.call.push(action);
      }
      if (_.has(object, 'body')) {
        manager.require(object.deps, function () {
          // is this necessary?
          if (!_.has(object, 'data')) {
            object.data = object.body.apply(undefined, arguments);
          }
          while (object.call.length > 0) {
            object.call.shift().call(undefined, object.data);
          }
        });
      } else moduleNotPresent.call(manager, object);
    }
  };

  manager.define = function (name, deps, body) { // if name is undefined call require?
    var object = getOrCreate(name);
    if (_.has(object, 'body')) {
      throw new Error('object "' + name + '" already exists');
    }
    object.deps = deps;
    object.body = body;
    // for beter iteration
    listOfObjects.push(object);
    if (undefined || object.call.length > 0) {
      manager.load(object);
    }
  };

  manager.require = function (deps, body) {
    if (deps.length === 0)
      body.apply(undefined);
    var todo = deps.length, _deps = _.clone(deps);
    var resolve = function (data, i) {
      _deps[i] = data;
      if (--todo <= 0)
        body.apply(undefined, _deps);
    };
    _.each(deps, function (name, i) {
      manager.load(getOrCreate(name), function (data) {
        resolve(data, i);
      });
    });
  };

};

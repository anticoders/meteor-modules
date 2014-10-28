Module.registerPlugin('livedata', [ '$module' ], function ($module) {

  $module.addToRecipies(function (instance, settings) {

    function prefix(name) {
      if (!settings.__name__) {
        return name;
      }
      return settings.__name__ + '/' + name;
    }

    var getArgs = function (args) {
      args = _.toArray(args);
      if (_.isString(args[0])) {
        args[0] = prefix(args[0]);
      }
      return args;
    }

    var proxyMethod = function (original, self) {
      return function () {
        return original.apply(self, getArgs(arguments));
      }
    };

    var proxyMethods = function (methods, self) {
      var proxy = Object.create(self);
      _.each(methods, function (name) {
        proxy[name] = proxyMethod(self[name], self);
      });
      return proxy;
    }

    _.extend(instance, {

      collection : function () {
        var collection = Object.create(Meteor.Collection.prototype);
        Meteor.Collection.apply(collection, getArgs(arguments));
        return collection;
      },

      methods : function (options) {
        var renamed = {};
        _.each(options, function (method, name) {
          renamed[settings.prefix(name)] = method;
        });
        Meteor.methods(renamed);
      },

      method : function (name, method) {
        var options = {};
        options[settings.prefix(name)] = method;
        Meteor.methods(options);
      },

      apply : proxyMethod(Meteor.apply, Meteor),

      call : proxyMethod(Meteor.call, Meteor),

    });

    // PUBLISH / SUBSCRIBE

    if (Meteor.isServer) {
      instance.publish = function (name, callback) {
        Meteor.publish(prefix(name), function () {
          var self = proxyMethods([ 'added', 'changed', 'removed', 'ready', 'onStop', 'error', 'stop' ], this);
          return callback.apply(self, arguments);
        });
      };
    }

    if (Meteor.isClient) {
      instance.subscribe = proxyMethod(Meteor.subscribe, Meteor);
    }

  });

});

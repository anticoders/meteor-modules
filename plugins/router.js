
Module.registerPlugin('router', [ '$module', '$template' ], function ($module) {

  if (!Package['iron:router']) {
    console.warn('Plugin `router` requires `iron:router` smart package to work properly.')
    return;
  }

  var RouteController = Package['iron:router'].RouteController;
  var Router = Package['iron:router'].Router;
  var slash = /^\//;

  $module.addToRecipies(function (instance, settings) {

    function prefix(name) {
      if (!settings.__name__) {
        return name;
      }
      return settings.__name__ + '/' + name;
    }

    function getArgs(args) {
      args = _.toArray(args);
      if (_.isString(args[0])) {
        args[0] = prefix(args[0]);
      }
      return args;
    }

    function proxyMethod(original, self) {
      return function () {
        return original.apply(self, getArgs(arguments));
      }
    };

    instance.getRouteFullName = function (routeName) {
      if (!settings.__name__) {
        return routeName;
      }
      return settings.__name__ + '/' + routeName;
    };

    var CustomRouteController = RouteController.extend({

      // TODO: more methods (e.g, redirect?)
      render: function () {
        var args = _.toArray(arguments);
        if (args.length >= 1 && _.isString(args[0])) {
          args[0] = instance.getTemplateFullName(args[0]);
        }
        return CustomRouteController.__super__.render.apply(this, args);
      },
      subscribe: function () {
        // TODO: I prefer to use instance.subscribe instead of Meteor.subscribe
        //       but for that we would need to imitate the wait API
        return CustomRouteController.__super__.subscribe.apply(this, getArgs(arguments));
      },

    });

    _.extend(instance, {
      go   : proxyMethod(Router.go, Router),
      path : proxyMethod(Router.path, Router),
    });

    instance.registerHelper('pathFor', function (routeName, params, options) {
      if (arguments.length == 2) {
        options = params;
        params  = this;
      }
      var hash = options.hash.hash, query = _.omit(options.hash, 'hash');
      return instance.path(routeName, params, {
        query: query, hash: hash
      });
    });

    instance.router = function (configure) {
      configure.call({
        route: function (routeName, options) {
          // we create even more customized controller for each route
          var controller = CustomRouteController.extend({
            //setLayout: function () { // XXX I don't like this monkey-patching style :/
            //  var args = _.toArray(arguments);
            //  args[0] = templates[routeName] || templates['__common__'] || args[0];
            //  return CustomRouteController.__super__.setLayout.apply(this, args);
            //},
          });

          if (slash.test(options.path)) {
            options.path = options.path.slice(1);
          }

          options.path = prefix(options.path);
          if (!slash.test(options.path)) {
            options.path = '/' + options.path;
          }

          options.controller = controller;
          
          if (_.isString(options.template)) {
            options.template = instance.getTemplateFullName(options.template);
          }

          Router.route(instance.getRouteFullName(routeName), options);
        }
      });
    };

  });

});


ModuleTool = function ModuleTool () {

  var moduleAPIs = {};
  var manager    = new ModuleFactoryManager();
  var plugins    = new AMDManager();

  function Module (moduleName) {

    var layerAPIs = {};

    var methods = moduleAPIs[moduleName];
    var module  = manager.getOrCreateModuleFactory(moduleName);

    if (methods) { // it's already there, so no need to create
      return methods;
    }

    moduleAPIs[moduleName] = methods = {};
    
    methods.load = function () {
      return module.instantiate.apply(module, arguments);
    };

    // short alias
    methods.as = methods.load;

    methods.extend = function (factory) {
      module.require('$config', function ($config) {
        module.require(module.plugins.concat($config.plugins), function () {
          module.addToRecipies(factory);
        });
      });
    };

    //methods.depend = function (deps) {
    //  return {
    //    extend: function (factory) {
    //      module.addToRecipies(function (instance) {
    //        instance.require(deps, function () {
    //          applyFactory(factory, instance, module);
    //        });
    //      });
    //    }
    //  };
    //};

    methods.configure = function (config) {
      config = config || {};
      module.define('$config', function () {
        return _.defaults(config, {
          name    : moduleName,
          plugins : [],
        });
      });
    };

    methods.define = function () {
      var args = arguments;
      module.addToRecipies(function (instance) {
        instance.define.apply(null, args);
      });
    };

    methods.require = function () {
      var args = arguments;
      module.addToRecipies(function (instance) {
        instance.require.apply(null, args);
      })
    };

    methods.addTemplate = function (templateName, templateFunc) {
      module.require('$config', function ($config) {
        module.require(module.plugins.concat($config.plugins), function () {
          module.addToRecipies(function (instance) {
            instance.__addTemplate__(templateName, templateFunc);
          });
        });
      });
    };

    methods.layer = function (layerName) {
      var layerAPI  = layerAPIs[layerName];
      if (layerAPI) return layerAPI;
      layerAPI = layerAPIs[layerName] = {
        extend: function (factory) {
          module.addLayerFactory(layerName, { body: factory });
        }, // extend
        depend: function (deps) {
          return {
            extend: function (factory) {
              module.addLayerFactory(layerName, { body: factory, deps: deps });
            },
          };
        }, // depend
        addTemplate: function (templateName, templateFunc) {
          module.addLayerFactory(layerName, { type: 'template', name: templateName, body: templateFunc });
        },
      };
      return layerAPI;
    };

    // load config and plugins

    module.require('$config', function ($config) {
      _.each(module.plugins.concat($config.plugins), function (pluginName) {
        plugins.require([pluginName], function (plugin) {
          module.define(pluginName, plugin.deps, plugin.body);
        });
      });
    });

    Meteor.startup(function () {
      if (!module.hasConfig()) {
        methods.configure();
      }
    });

    Meteor.startup(function () {
      var cache = {};
      if (Meteor.isServer) {
        methods.compile = function (layerName) {
          if (!cache[layerName]) {
            cache[layerName] = module.compileLayer(layerName);
          }
          return cache[layerName];
        };
      }
    });
    
    return methods;
  };

  Module.registerPlugin = function (pluginName, deps, body) {
    if (arguments.length === 2) {
      body = deps; deps = [];
    }
    if (!_.isFunction(body)) {
      throw new Meteor.Error('plugin body must be a function');
    }
    plugins.define(pluginName, [], function () {
      return {
        name: pluginName,
        body: body,
        deps: deps,
      }
    });
  };

  return Module;
};


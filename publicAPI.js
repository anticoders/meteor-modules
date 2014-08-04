var moduleAPIs = {};
var plugins    = new AMDManager();

Module = function (moduleName, widgetName) {

  var layerAPIs = {};

  // TODO: use define/require instead of global array
  var moduleAPI = moduleAPIs[moduleName];
  var module    = getOrCreateModule(moduleName);

  if (moduleAPI) { // it's already there, so no need to create
    return moduleAPI;
  }

  moduleAPIs[moduleName] = moduleAPI = {};
  
  moduleAPI.as = moduleAPI.load = function () {
    return module.instantiate.apply(module, arguments);
  };

  moduleAPI.translateTo = function (language, map) {
    module.i18n.translateTo(language, map);
  };

  moduleAPI.extend = function (factory) {
    module.require('$config', function ($config) {
      module.require(module.plugins.concat($config.plugins), function () {
        console.log('plugins are ready');
        module.addToRecipies(factory);
      });
    });
  };

  moduleAPI.depend = function (deps) {
    return {
      extend: function (factory) {
        module.addToRecipies(function (instance) {
          instance.require(deps, function () {
            applyFactory(factory, instance, module);
          });
        });
      }
    };
  };

  moduleAPI.configure = function (config) {
    config = config || {};
    module.define('$config', function () {
      return _.defaults(config, {
        name    : moduleName,
        plugins : [],
      });
    });
  };

  // load plugins when config is ready
  module.require('$config', function ($config) {
    _.each(module.plugins.concat($config.plugins), function (pluginName) {
      plugins.require([pluginName], function (plugin) {
        module.define(pluginName, plugin.deps, plugin.body);
      });
    });
  });

  moduleAPI.define = function () {
    var args = arguments;
    module.addToRecipies(function (instance) {
      instance.define.apply(null, args);
    });
  };

  moduleAPI.require = function () {
    var args = arguments;
    module.addToRecipies(function (instance) {
      instance.require.apply(null, args);
    })
  };

  moduleAPI.addTemplate = function (templateName, templateFunc) {
    module.require('$config', function ($config) {
      module.require(module.plugins.concat($config.plugins), function () {
        module.addToRecipies(function (instance) {
          instance.__addTemplate__(templateName, templateFunc);
        });
      });
    });
  };

  moduleAPI.layer = function (layerName) {
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

  Meteor.startup(function () {
    var cache = {};
    if (Meteor.isServer) {
      moduleAPI.compile = function (layerName) {
        if (!cache[layerName]) {
          cache[layerName] = module.compileLayer(layerName);
        }
        return cache[layerName];
      };
    }
  });
  
  return moduleAPI;
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

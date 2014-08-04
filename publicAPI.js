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
    module.addToRecipies(factory);
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

  moduleAPI.usePlugin = function (pluginName) {
    module.usePlugin(pluginName);
    //---------------------------------------------
    plugins.require([pluginName], function (plugin) {
      module.addToRecipies(function (instance) {
        instance.define(pluginName, plugin.deps, function () {
          plugin.body.call(null, instance);
        });
      }, { type: 'plugin' });
    });
  };

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
    module.addToRecipies(function (instance) {
      instance.__addTemplate__(templateName, templateFunc);
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

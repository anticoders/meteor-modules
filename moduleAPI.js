var moduleAPIs = {};
var plugins    = {};

Module = function (moduleName, widgetName) {

  var layerFactories = {};
  var layerAPIs = {};

  // TODO: use define/require instead of global array
  var moduleAPI = moduleAPIs[moduleName];
  var module    = getOrCreateModule(moduleName);

  if (moduleAPI) { // it's already there, so no need to create
    return moduleAPI;
  }

  moduleAPIs[moduleName] = moduleAPI = {};
  
  moduleAPI.as = function () {
    return module.instantiate.apply(module, arguments);
  };

  moduleAPI.translateTo = function (language, map) {
    module.i18n.translateTo(language, map);
  };

  moduleAPI.freeze = function () {
    module.isFrozen = true;
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

  moduleAPI.include = function (pluginName) {
    var plugin = plugins[pluginName];
    if (!plugin) {
      throw new Error('Plugin ' + pluginName + ' does not exist');
    }
    module.addToRecipies(function (instance, settings) {
      instance.define(pluginName, plugin.deps, plugin.body);
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

  moduleAPI.lazy = function () {

  };

  moduleAPI.addTemplate = function (templateName, templateFunc) {
    module.addToRecipies(function (instance) {
      console.log('define template', templateName);
      instance.__addTemplate__(templateName, templateFunc);
    });
  };

  moduleAPI.layer = function (layerName) {
    var layerAPI  = layerAPIs[layerName];
    var factories = layerFactories[layerName];

    if (layerAPI) return layerAPI;

    factories = layerFactories[layerName] = [];
    layerAPI = layerAPIs[layerName] = {
      extend: function (factory) {
        factories.push({
          body: factory,
          deps: [],
        });
      }, // extend
      depend: function (deps) {
        return {
          extend: function (factory) {
            factories.push({
              body: factory,
              deps: deps,
            });
          },
        };
      }, // depend
      addTemplate: function (templateName, templateFunc) {
        factories.push({
          deps: [],
          body: "function (instance) {\n" +
            "$instance.__addTemplate__(" + JSON.stringify(templateName) + ", " + templateFunc.toString() + ");\n" +
          "}\n"
        });
      },
    };

    return layerAPI;
  };

  Meteor.startup(function () {

    var cache = {};

    if (Meteor.isServer) {

      moduleAPI.compile = function (layerName) {
        var deps;
        if (!cache[layerName]) {
          deps = [];
          _.each(layerFactories[layerName], function (factory) {
            Array.prototype.push.apply(deps, factory.deps);
          });
          deps = _.map(_.unique(deps), function (name) { return JSON.stringify(name); });
          //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
          cache[layerName] = 'Module(' + JSON.stringify(moduleName) + ').define(' + JSON.stringify(layerName) + ', [ "$instance", ' + deps.join(', ') + '], function ($instance) {\n' +
            _.map(layerFactories[layerName], function (factory) {
              return '$instance.__useFactory__(' + factory.body.toString() + ');';
            }).join(';\n') + '\n' +
          '});';
        }
        return cache[layerName];
      };

    } else {

      // TODO: lazy definition

    }

  });
  
  return moduleAPI;
};

Module.registerPlugin = function (pluginName, deps, body) {
  if (arguments.length === 2) {
    body = deps; deps = [];
  }
  if (!_.isFunction(body)) {
    throw new Meteor.Error('body must be a function');
  }
  plugins[pluginName] = {
    body: body,
    deps: deps,
  };
};

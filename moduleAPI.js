
var modules    = {};
var moduleAPIs = {};
var plugins    = {};

// TODO: eventually get rid of this method

var registerModule = function (moduleName) {
  var module;

  if (moduleName in modules) {
    throw new Error('module ' + moduleName + ' already registered');
  }

  var manager = new AMDManager();

  module = modules[moduleName] = {
    
    settings  : {},
    instances : {},
    factories : [],
    i18n      : i18n.namespace(),

    require   : _.bind(manager.require , manager),
    define    : _.bind(manager.define  , manager),

    addToRecipies: function (factory) {
      var listOfNames = _.keys(module.instances);
      module.factories.push(factory);
      _.each(listOfNames, function (name) {
        factory.call({}, module.instances[name], module.settings[name], module.i18n, module.require);
      });
    },
  };

  module.addToRecipies(function (instance, settings, i18n) {
    // just for fun ;)
    console.log('creating instance ' + settings.__name__ + ' of module ' + settings.__module__);
    // for convenience
    instance.i18n = i18n;
  });
};

module = function (moduleName, widgetName) {

  var widgetFactories = {};
  var widgetAPIs = {};

  if (!_.has(modules, moduleName)) {
    registerModule(moduleName);
  }

  // TODO: use define/require instead of global array
  var moduleAPI = moduleAPIs[moduleName];
  var module    = modules[moduleName];

  if (moduleAPI) { // it's already there, so no need to create
    return moduleAPI;
  }

  moduleAPIs[moduleName] = moduleAPI = {};
  
  moduleAPI.as = function (instanceName, settings) {

    var instance;

    settings = settings || {};
    settings.__module__ = moduleName;

    instance = {};

    _.each(module.factories, function (factory) {
      factory.call({}, instance, settings, module.i18n, module.require);
    });

    // remember for further use
    module.instances[instanceName] = instance;
    module.settings[instanceName] = settings;

    return instance;
  };

  moduleAPI.translateTo = function (language, map) {
    module.i18n.translateTo(language, map);
  };

  // this is pretty unsafe :/
  // at least we should provide "freeze" method
  // to prevent module from further modifications
  moduleAPI.extend = function (factory) {
    module.addToRecipies(factory);
  };

  moduleAPI.depend = function (deps) {
    return {
      extend: function (factory) {
        module.require(deps, function () {
          module.extend(factory);
        });
      }
    };
  };

  moduleAPI.include = function (pluginName) {
    // TODO: check for errors
    module.define(plugin, plugins[pluginName].deps, function () {
      return plugins[pluginName].body(module);
    });
  };

  moduleAPI.define = function () {

  };

  moduleAPI.require = function () {

  };

  moduleAPI.lazy = function () {

  };

  moduleAPI.widget = function (widgetName) {
    var widgetAPI = widgetAPIs[widgetName];
    var factories = widgetFactories[widgetName];

    if (widgetAPI) {
      return widgetAPI;
    }

    factories = widgetFactories[widgetName] = [];
    widgetAPI = widgetAPIs[widgetName] = {
      extend: function (factory) {
        factories.push(factory);
      },
      depend: function (deps) {
        return {
          extend: function (factory) {
            factory.deps = deps;
            factories.push(factory);
          },
        };
      },
    };

    return widgetAPI;
  };

  module.define('$module', [], function () {
    return moduleAPI;
  });

  Meteor.startup(function () {

    if (Meteor.isServer) {

      moduleAPI.compile = function (widgetName) {
        return 'module(' + JSON.stringify(moduleName) + ').define(' + widgetName + ', [ "$module" ], function ($module) {\n' +
          _.map(widgetFactories[widgetName], function (factory) {
            return '$module.depend(' + JSON.stringify(factory.deps) +
              ').extend(' + factory.toString() + '\n);';
          }).join(';\n') + '\n' +
        '});';
      };

    } else {

      // TODO: lazy definition

    }

  });
  
  return moduleAPI;
};

module.registerPlugin = function (pluginName, deps, body) {
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

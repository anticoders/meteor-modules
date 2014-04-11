
var modules    = {},
    moduleAPIs = {};

// TODO: eventually get rid of this method

var registerModule = function (moduleName) {
  var module;

  if (moduleName in modules) {
    throw new Error('module ' + moduleName + ' already registered');
  }

  module = modules[moduleName] = {
    settings  : {},
    instances : {},
    factories : [],
    i18n      : i18n.namespace(),

    addToRecipies: function (factory) {
      var listOfNames = _.keys(module.instances);
      module.factories.push(factory);
      _.each(listOfNames, function (name) {
        factory.call({}, module.instances[name], module.settings[name], module.i18n);
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

Module = function (moduleName) {

  if (!_.has(modules, moduleName)) {
    registerModule(moduleName);
  }

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
      // TODO: think about adding third argument: 
      factory.call({}, instance, settings, module.i18n);
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
  
  return moduleAPI;
};


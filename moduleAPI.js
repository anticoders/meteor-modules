
var modules    = {};
var moduleAPIs = {};
var plugins    = {};

function createModule(moduleName) {
  if (moduleName && (moduleName in modules))
    throw new Error('module ' + moduleName + ' already exists');

  var manager = new AMDManager();

  var module = {

    instancesByName : {},
    factories       : [],
    i18n            : i18n.namespace(),

    addToRecipies: function (factory) {
      if (module.isFrozen) {
        throw new Error('Cannot add a new recipie to module `' + moduleName + '` since it is already frozen.');
      }
      var listOfNames = _.keys(module.instancesByName);
      module.factories.push(factory);
      _.each(listOfNames, function (name) {
        applyFactory(factory, name, module);
      });
    },

    instantiate: function (instanceName, settings) {

      if (instanceName in module.instancesByName)
        throw new Error('instance ' + instanceName + ' already exists');

      var instance = {};
      var manager = new AMDManager();

      settings = settings || {};
      settings.__module__ = moduleName;
      settings.__name__ = instanceName;

      module.instancesByName[instanceName] = {
        settings : settings,
        require  : wrapRequire(manager),
        define   : wrapDefine(manager),
      };

      _.each(module.factories, function (factory) {
        applyFactory(factory, instanceName, module);
      });

      return module.instancesByName[instanceName];
    },
  };

  // built-in definitions

  // do we want to make this one optional?
  module.addToRecipies(function (instance) {
    var _Template = function Template () {};

    if (typeof Template !== 'undefined') {
      _Template.prototype = Object.create(Template.prototype);
      _Template.prototype.constructor = _Template;
    }

    instance.Template = { prototype: _Template.prototype };
  });

  module.addToRecipies(function (instance, settings) {
    instance.i18n = module.i18n;
    instance.define('$instance', function () {
      return instance; // useful for plugins
    });
  });

  if (moduleName) {
    modules[moduleName] = module;
  }

  return module;
};

Module = function (moduleName, widgetName) {

  var widgetFactories = {};
  var widgetAPIs = {};

  if (!_.has(modules, moduleName)) {
    createModule(moduleName);
  }

  // TODO: use define/require instead of global array
  var moduleAPI = moduleAPIs[moduleName];
  var module    = modules[moduleName];

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
    if (!Meteor.isClient) return;

    module.addToRecipies(function (instance) {
      var settings = instance.settings;
      var _Template = instance.Template;

      // TODO: better error messages
      if (_Template.hasOwnProperty(templateName)) {
        if (_Template[templateName].__makeView)
          throw new Error("There are multiple templates named '" + templateName + "'. Each template needs a unique name.");
        throw new Error("This template name is reserved: " + templateName);
      }

      // TODO: use prefixed name

      var tmpl = new _Template.prototype.constructor;
      var templateNameWithPrefix = settings.__name__ + '_' + templateName

      tmpl.__viewName     = 'Template.' + templateName;
      tmpl.__templateName = templateNameWithPrefix;
      tmpl.__render       = templateFunc;

      // note the three methods of accessing this template
      _Template[templateName] = tmpl;

      _Template.prototype[templateName] = tmpl;

      Template[templateNameWithPrefix] = tmpl;
    });
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

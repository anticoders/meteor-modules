
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

      var instance;
      var manager = new AMDManager();

      settings = settings || {};
      settings.__module__ = moduleName;
      settings.__name__ = instanceName;

      instance = module.instancesByName[instanceName] = {
        settings : settings,
        require  : wrapRequire(manager),
        define   : wrapDefine(manager),

        // we use this one for lazy loading
        __useFactory__ : function (factory) {
          applyFactory(factory, instance, module);
        },

        __addTemplate__: function (templateName, templateFunc) {
          var _Template = instance.Template;

          if (!_Template) return;

          // TODO: better error messages
          if (_Template.hasOwnProperty(templateName)) {
            if (_Template[templateName].__makeView)
              throw new Error("There are multiple templates named '" + templateName + "'. Each template needs a unique name.");
            throw new Error("This template name is reserved: " + templateName);
          }

          // TODO: use prefixed name

          var tmpl = new _Template.prototype.constructor;
          var templateNameWithPrefix = settings.__name__ + '_' + templateName;

          tmpl.__viewName     = 'Template.' + templateName;
          tmpl.__templateName = templateNameWithPrefix;
          tmpl.__render       = templateFunc;

          _Template[templateName] = tmpl;

          _Template.prototype[templateName] = tmpl;

          if (typeof Template !== 'undefined') {
            Template[templateNameWithPrefix] = tmpl;
          }
        },
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

  var layerFactories = {};
  var layerAPIs = {};

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

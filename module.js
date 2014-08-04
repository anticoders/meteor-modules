var modules = {};

getOrCreateModule = function (moduleName) {

  if (moduleName && modules[moduleName] !== undefined) {
    return modules[moduleName];
  }

  var requests = {}, manager = new AMDManager();

  var module = {

    instancesByName : {},
    layerFactories  : {},
    factories       : [],
    plugins         : [ '$instance', '$ready', '$template' ],
    require         : wrapRequire(manager),
    define          : wrapDefine(manager),
    i18n            : i18n.namespace(),

    addToRecipies: function (factory, options) {
      options = options || {};
      options.type = options.type || 'factory';
      module.factories.push({
        type: options.type,
        body: factory,
      });
      _.each(_.keys(module.instancesByName), function (name) {
        applyFactory(factory, name, module, { isPlugin: options.type === 'plugin' });
      });
    },

    addLayerFactory: function (layerName, options) {
      if (!module.layerFactories[layerName]) {
        module.layerFactories[layerName] = [];
      }
      module.layerFactories[layerName].push({
        type: options.type || 'factory',
        deps: options.deps || [],
        name: options.name,
        body: options.body,
      });
    },

    hasConfig: function () {
      return !!manager.get('$config');
    },

    compileLayer: function (layerName) {
      var deps = [];
      _.each(module.layerFactories[layerName], function (factory) {
        Array.prototype.push.apply(deps, factory.deps);
      });
      deps = _.map(_.unique(deps), function (name) { return JSON.stringify(name); });
      //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      return 'Module(' + JSON.stringify(moduleName) + ').define(' + JSON.stringify(layerName) + ', [ "$instance", ' + deps.join(', ') + '], function ($instance) {\n\n' +
        _.map(module.layerFactories[layerName], function (factory) {
          if (factory.type === 'template') {
            return "$instance.__addTemplate__(" + JSON.stringify(factory.name) + ", " + factory.body.toString() + ");";
          }
          return '$instance.__useFactory__(' + factory.body.toString() + ');';
        }).join('\n\n') + '\n\n' +
      '});';
    },

    instantiate: function (instanceName, settings) {
      if (instanceName in module.instancesByName)
        throw new Error('instance ' + instanceName + ' already exists');

      var instance;
      var manager = new AMDManager();
      var useAjax = false;

      manager.onModuleNotFound(function (__module__) {
        var requestURL = '/modules/' + moduleName + '/' + __module__.name;
        if (useAjax && !requests[requestURL]) {
          requests[requestURL] = true;
          $.ajax({
            url  : requestURL,
            type : 'GET', dataType : 'script',
          }).done(function (message) {});
        }
      });

      Meteor.startup(function () {
        useAjax = true;
      });

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

          // TODO: print warning
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
        applyFactory(factory.body, instanceName, module, {
          isPlugin: factory.type === 'plugin'
        });
      });

      return module.instancesByName[instanceName];
    },
  };

  // built-in definitions

  module.define('$module', [], function () {
    return module;
  });

  if (moduleName) {
    modules[moduleName] = module;
  }

  return module;
};

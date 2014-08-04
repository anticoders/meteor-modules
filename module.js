var modules = {};

getOrCreateModule = function (moduleName) {
  if (moduleName && (moduleName in modules)) {
    return modules[moduleName];
  }

  var manager = new AMDManager();
  var requests = {};

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

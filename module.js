
ModuleFactory = function ModuleFactory (name) {
  //TODO: "factories" should read "recepies" and "layerFactories" should read "layerRecepies"

  var manager = new AMDManager();
  var self = this;

  self.instancesByName = {};
  self.layerFactories  = {};
  self.factories       = [];
  self.plugins         = [ '$instance', '$ready', '$template' ];
  self.require         = wrapRequire(manager);
  self.define          = wrapDefine(manager);
  self.i18n            = i18n.namespace();
  self.name            = name;

  self._requests = {};

  self.hasConfig = function () {
    return !!manager.get('$config');
  }
}

ModuleFactory.prototype.addToRecipies = function (factory, options) {
  var module = this;
  //----------------------
  options = options || {};
  options.type = options.type || 'factory';
  module.factories.push({
    type: options.type,
    body: factory,
  });
  _.each(_.keys(module.instancesByName), function (name) {
    applyFactory(factory, name, module, { isPlugin: options.type === 'plugin' });
  });
};

ModuleFactory.prototype.addLayerFactory = function (layerName, options) {
  var module = this;
  //--------------------------------------
  if (!module.layerFactories[layerName]) {
    module.layerFactories[layerName] = [];
  }
  module.layerFactories[layerName].push({
    type: options.type || 'factory',
    deps: options.deps || [],
    name: options.name,
    body: options.body,
  });
};

ModuleFactory.prototype.compileLayer = function (layerName) {
  var module = this, deps = [];
  //-----------------------------------------------------------
  _.each(module.layerFactories[layerName], function (factory) {
    Array.prototype.push.apply(deps, factory.deps);
  });
  deps = _.map(_.unique(deps), function (name) { return JSON.stringify(name); });
  //------------------------------------------------------------------------------------------------------------------------------------------------------------------
  return 'Module(' + JSON.stringify(module.name) + ').define(' + JSON.stringify(layerName) + ', [ "$instance", ' + deps.join(', ') + '], function ($instance) {\n\n' +
    _.map(module.layerFactories[layerName], function (factory) {
      if (factory.type === 'template') {
        return "$instance.__addTemplate__(" + JSON.stringify(factory.name) + ", " + factory.body.toString() + ");";
      }
      return '$instance.__useFactory__(' + factory.body.toString() + ');';
    }).join('\n\n') + '\n\n' +
  '});';
};

ModuleFactory.prototype.instantiate = function (instanceName, settings) {
  var module = this;
  //-----------------------------------------
  if (instanceName in module.instancesByName)
    throw new Error('instance ' + instanceName + ' already exists');

  var instance;
  var manager = new AMDManager();
  var useAjax = false;

  if (Meteor.isClient) {
    manager.onModuleNotFound(function (__module__) {
      var requestURL = '/modules/' + module.name + '/' + __module__.name;
      if (useAjax && !module._requests[requestURL]) {
        module._requests[requestURL] = true;
        $.ajax({
          url  : requestURL,
          type : 'GET', dataType : 'script',
        }).done(function (message) {});
      }
    });

    Meteor.startup(function () {
      useAjax = true;
    });
  }

  settings = settings || {};
  settings.__module__ = module.name;
  settings.__name__ = instanceName;

  instance = module.instancesByName[instanceName] = {
    settings : settings,
    require  : wrapRequire(manager),
    define   : wrapDefine(manager),

    // we use this one for lazy loading
    __useFactory__ : function (factory) {
      applyFactory(factory, instance, module);
    },

  };

  _.each(module.factories, function (factory) {
    applyFactory(factory.body, instanceName, module, {
      isPlugin: factory.type === 'plugin'
    });
  });

  return module.instancesByName[instanceName];
};


ModuleFactoryManager = function ModuleFactoryManager () {
  this.modules = {};
}

ModuleFactoryManager.prototype.getOrCreateModuleFactory = function (moduleName) {
  var manager = this;
  //------------------------------------------------------------
  if (moduleName && manager.modules[moduleName] !== undefined) {
    return manager.modules[moduleName];
  }

  var module = new ModuleFactory(moduleName);

  // built-in definitions

  module.define('$module', [], function () {
    return module;
  });

  if (moduleName) {
    //XXX does it make sense to have anonymous modules?
    manager.modules[moduleName] = module;
  }

  return module;
};

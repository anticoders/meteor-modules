
var propertiesOfInstance = [ 'settings', 'require', 'define', 'Template', 'i18n' ];

applyFactory = function (factory, instance, module, options) {
  var args = [], instanceName = '';

  options = options || {};

  if (typeof instance === 'string') {
    instanceName = instance; instance = module.instancesByName[instanceName];
  } else {
    instanceName = instance.settings.__name__;
  }

  if (!instance) {
    throw new Error('Instance `' + instanceName + '` does not exist.');
  }

  args = [ instance ].concat(_.map(propertiesOfInstance, function (name) {
    return instance[name];
  }));

  if (options.isPlugin) {
    factory.apply({}, args);
  } else {
    instance.require(module.plugins, function ($instance) {
      factory.apply({}, args);
    });
  }
}

getFactoryArgsString = function (moduleName) {
  return toCamelCase(moduleName) + ', ' + propertiesOfInstance.join(', ');
}

toCamelCase = function (name) {
  return name.replace(/(^|[^a-zA-Z])[a-z]/g, function (match) {
    return match[match.length - 1].toUpperCase();
  });
}


var propertiesOfInstance = [ 'instance', 'settings', 'require', 'define', 'Template' ];
var propertiesOfModule   = [ 'i18n' ];

applyFactory = function (factory, instance, module) {
  var args = [], instanceName = '';

  if (typeof instance === 'string') {
    instanceName = instance; instance = module.instancesByName[instanceName];
  } else {
    instanceName = instance.settings.__name__;
  }

  if (!instance) {
    throw new Error('Instance `' + instanceName + '` does not exist.');
  }

  _.each(propertiesOfInstance, function (name) {
    if (name !== 'instance') {
      args.push(instance[name]);
    } else {
      args.push(instance);
    }
  });

  _.each(propertiesOfModule, function (name) {
    args.push(module[name]);
  });

  factory.apply({}, args);
}

getFactoryArgsString = function (moduleName) {
  return _.map(propertiesOfInstance, function (name) {
    return name === 'instance' ? toCamelCase(moduleName) : name;
  }).concat(propertiesOfModule).join(', ');
}

toCamelCase = function (name) {
  return name.replace(/(^|[^a-zA-Z])[a-z]/g, function (match) {
    return match[match.length - 1].toUpperCase();
  });
}

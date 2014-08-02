
var propertiesOfInstance = [ 'instance', 'settings', 'require', 'define', 'Template' ];
var propertiesOfModule   = [ 'i18n' ];

applyFactory = function (factory, instanceName, module) {
  var instance = module.instancesByName[instanceName], args = [];

  _.each(propertiesOfInstance, function (name) {
    args.push(instance[name]);
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

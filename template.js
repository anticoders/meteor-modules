
Module.registerPlugin('$template', [ '$module' ], function ($module) {
  $module.addToRecipies(function (instance, settings) {
    
    var constructor = function Template () {};

    if (typeof Template !== 'undefined') {
      constructor.prototype = Object.create(Template.prototype);
      constructor.prototype.constructor = constructor;
    }

    var _Template = { prototype: constructor.prototype };
    var _globalHelpers = {};

    // we're trying to mimic the original blaze behavior here

    _Template.__lookup__ = function (templateName) {
      if (!_hasOwnProperty.call(_Template, templateName))
        return null;
      var tmpl = _Template[templateName];
      if (tmpl && tmpl.__makeView) // isTemplate?
        return tmpl;
      return null;
    };

    _Template.__create__ = function (viewName, templateFunc, initView) {
      var tmpl = new _Template.prototype.constructor;
      tmpl.__viewName = viewName;
      tmpl.__render = templateFunc;
      if (initView)
        tmpl.__initView = initView;
      return tmpl;
    };

    _Template.prototype.__makeView = function () {
      var view = Template.prototype.__makeView.apply(this, arguments);
      view.lookup = function (name, _options) {
        var template = this.template;
        var lookupTemplate = _options && _options.template;

        if (/^\./.test(name)) {
          if (!/^(\.)+$/.test(name))
            throw new Error("id starting with dot must be a series of dots");
          return Blaze._parentData(name.length - 1, true /*_functionWrapped*/);
        } else if (template && (name in template)) {
          return wrapHelper(bindDataContext(template[name]));
        } else if (lookupTemplate && _Template.__lookup__(name)) {
          return _Template.__lookup__(name);
        } else if (_globalHelpers[name]) {
          return wrapHelper(bindDataContext(_globalHelpers[name]));
        }
        return Blaze.View.prototype.lookup.apply(this, arguments)
      }
      return view;
    }

    instance.Template = _Template;

    instance.__addTemplate__ = function (templateName, templateFunc) {

      // TODO: better error messages
      if (_Template.hasOwnProperty(templateName)) {
        if (_Template[templateName].__makeView)
          throw new Error("There are multiple templates named '" + templateName + "'. Each template needs a unique name.");
        throw new Error("This template name is reserved: " + templateName);
      }

      var templateFullName = instance.getTemplateFullName(templateName);
      var tmpl = _Template.__create__('Template.' + templateFullName, templateFunc);

      tmpl.__templateName = templateFullName;

      _Template[templateName] = tmpl;

      if (typeof Template !== 'undefined') {
        Template[templateFullName] = tmpl;
      }
    };

    UI.registerHelper(settings.__name__, function () {
      return _Template;
    });

    // "global" helpers scoped to the module namespace
    instance.registerHelper = function (helperName, helperFunc) {
      if (_globalHelpers.hasOwnProperty(helperName)) {
        throw new Error("Helper " + helperName + " already exists.");
      }
      _globalHelpers[helperName] = helperFunc;
    };

    instance.getTemplateFullName = function (templateName) {
      if (!settings.__name__) {
        return templateName;
      }
      return settings.__name__ + '_' + templateName;
    };

  });
});

var _hasOwnProperty = Object.prototype.hasOwnProperty;

var bindDataContext = function (x) {
  if (typeof x === 'function') {
    return function () {
      var data = Blaze.getCurrentData();
      if (data == null)
        data = {};
      return x.apply(data, arguments);
    };
  }
  return x;
};

var wrapHelper = function (f) {
  return Blaze.wrapCatchingExceptions(f, 'template helper');
};

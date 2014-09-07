
Module.registerPlugin('$template', [ '$module' ], function ($module) {
  $module.addToRecipies(function (instance, settings) {
    
    var Template = function Template () {
      Blaze.Template.apply(this, arguments);
    };

    Template.prototype = Object.create(Blaze.Template.prototype);
    Template.prototype.constructor = Template;

    var _globalHelpers = Object.create(UI._globalHelpers);

    // we're trying to mimic the original blaze behavior here

    Template.prototype.constructView = function () {
      var view = Blaze.Template.prototype.constructView.apply(this, arguments);
      view.lookup = function (name, _options) {
        var template = this.template;
        var lookupTemplate = _options && _options.template;
        if (/^\./.test(name)) {
          // starts with a dot. must be a series of dots which maps to an
          // ancestor of the appropriate height.
          if (!/^(\.)+$/.test(name))
            throw new Error("id starting with dot must be a series of dots");

          return Blaze._parentData(name.length - 1, true /*_functionWrapped*/);
        } else if (template && (name in template)) {
          return wrapHelper(bindDataContext(template[name]));
        } else if (lookupTemplate && (name in Template) && (Template[name] instanceof Template)) {
          return Blaze.Template[name];
        } else if (_globalHelpers[name]) {
          return wrapHelper(bindDataContext(_globalHelpers[name]));
        }
        return Blaze.View.prototype.lookup.apply(this, arguments)
      }
      return view;
    }

    instance.Template = Template;

    instance.__addTemplate__ = function (name, renderFunc) {

      // TODO: better error messages
      if (name in Template) {
        if ((Template[name] instanceof Template) && name !== "body")
          throw new Error("There are multiple templates named '" + name + "'. Each template needs a unique name.");
        throw new Error("This template name is reserved: " + name);
      }

      var templateFullName = instance.getTemplateFullName(name);
      var template = new Template('Template.' + templateFullName, renderFunc);

      Template[name] = template;

      // do we really need this?
      Blaze.Template[templateFullName] = template;
    };

    UI.registerHelper(settings.__name__, function () {
      return Template;
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

// this is copy/pasted from meteor/packages/blaze/lookup.js

// If `x` is a function, binds the value of `this` for that function
// to the current data context.
var bindDataContext = function (x) {
  if (typeof x === 'function') {
    return function () {
      var data = Blaze.getData();
      if (data == null)
        data = {};
      return x.apply(data, arguments);
    };
  }
  return x;
};

var wrapHelper = function (f) {
  return Blaze._wrapCatchingExceptions(f, 'template helper');
};



// TODO: mre grained dpenedency (at language level?)
// TODO: create a system to register missing phrases
//       and a heandy tool to write translations
// TODO: define default language, so that we don't display warnings when they're not needed 

var language = 'en',
    dependency = new Deps.Dependency();

// TODO: make a global translator
i18n = function () {};

i18n.setLanguage = function (anotherLanguage) {
  if (anotherLanguage !== language) {
    language = anotherLanguage;
    dependency.changed();
  }
};

i18n.getLanguage = function () {
  dependency.depend();
  return language;
};

i18n.namespace = function () {

  var api, maps = {};

  var api = function (original) {
    var translated;
    dependency.depend();
    if (maps[language] !== undefined) {
      translated = maps[language][original];
      if (translated) {
        return translated;
      }
    }
    console.warn('Translation for `' + original + '` is missing.');
    return original;
  }

  api.translateTo = function (language, map) {
    var myMap = maps[language];
    if (myMap === undefined) {
      myMap = maps[language] = {};
    }
    map.call({}, function (original) {
      return {
        to: function (translation) {
          myMap[original] = translation;
        }
      };
    });
    dependency.changed();
  }

  return api;
}

// this is just for safety, but shouln't be used
/*UI.registerHelper('i18n', function (original) {
  console.warn('Requested translation for `' + original + '`, ...');
  console.warn('... but global i18n helpers should not be used at this moment.');
  return original;
});*/


This is not a part of documentation. Just a loose ideas on how the API might look like.

```javascript
// mySuperModule.json

{
  "plugins": [ "namespace", "router" ]
}

// in namespace package:
    
Module && Module.registerPlugin('namespace', [ '$module' ], function ($module) {
  $module.addToRecipies(function (instance, settings) {
    namespace(instance, settings.__name__);
  });
});

// each module comes equipped with a built-in definition
  
module('mySuperModule').define('$module', function () {
  return module('mySuperModule');
});

module('mySuperModule').include('namespace');
module('mySuperModule').include('someFunnyFeature');
  
// this basically translates to
  
module('mySuperModule').define('namespace', [ '$module' ], function ($module) {
  return plugins['namepsace']($module);
});
 
// now, you can do stuff like
  
module('mySuperModule').extend(function (instance, settings, i18n, require) {
  require('someFunnyFeature', function (someFunnyFeature) {
    instance.sayHello = someFunnyFeature.sayHello;
  });
});

// or maybe

module('mySuperModule').depend([
  'someFunnyFeature'
]).extend(function (instance, settings, i18n, require) {
  instance.sayHello = require('someFunnyFeature').sayHello;
});
  
// which is just a syntactic sugar for doing this:

module('mySuperModule').require(['$module', /* ... */], function ($module) {
  $module.extend(function (instance, settings) {
    // ...
  });
});

// on the server side
Module('mySuperModule').layer('dashboard').extend(function () {
  // ...
});

// under /modules/mySuperModule/dashboard there will be the following code

Module('mySuperModule').define('dashboard', function (instance) {

  instance.require([ /* ... */ ], function () {
    // ...
  });

  instance.require([ /* ... */ ], function () {
    // ...
  });

});

// on the server the factories are not executed automatically, but the response for /modules/mySuperModule/editor will be:
  
module('mySuperModule').define('editor', [ '$module' ], function ($module) {
  $module.depend([
    // dependencies for this factory
  ]).extend(function (instance, settings) {
    // source code of this factory
  });
});

var myModuleInstance = {};

module('mySuperModule').as(myModuleInstance);

module('mySuperModule').extend(function (instance, settings) {
  
  var $module = this;
  var i18n = $module.i18n;
  // does it make any sense?
  var require = $module.require;
  
  instance.router(function () {
    this.route({
      path: '/edit',
      waitOn: function () {
        return require('editor');
      },
    });
  });
  
});
```

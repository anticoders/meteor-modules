# Notes on updating to Meteor 0.9.x

This package is now called `anti:modules`.

# meteor-modules

A comprehensive module manager designed for meteor.

## Installation

```
meteor add anti:modules
```

## Basic usage: layers

Layers are used for incremental loading of your app source code. To use them first add `.module.js` and `.module.html` extensions to selected files and put them in a folder called `layers`. It should be visible for both server and client. For example:
```
myMeteorApp
  client
    regularFile.js
    ...
  server
  layers
    layer1
      file1.module.js
      file2.module.html
    layer2
      file3.module.js
      file4.module.html
```
The layers will not be included with client side source code at first. To use them, you will first need to declare that you want to have an instance of the `$global` module:
```javascript
myApp = Module('$global').as('myApp');
```
Once it's done, you can require each layer at anytime:
```javascript
myApp.require('layer1', function () {
  console.log('layer1 is now ready to use');
});
```

## Advanced usage

Briefly speaking, you can divide your app into any number of independent modules. Modules are useful, because they provide namespacing for some global objects like templates, helpers, collections and routes. Also, a single module may be instantiated multiple times with different configuration. Additionally, each module may consist of multiple source code layers which may be loaded on demand, only when they're needed.

### Defining modules

Only files with `.module.js` and `.module.html` extensions counts as module building blocks. There are several ways to tell what module a particular file belongs to. If your project structure looks more or less like this:
```
myMeteorApp
  modules
    module1.module.js
    module2
      file1.module.js
      file2.module.js
  client
    modules
      module1
        file3.module.js
        file4.module.html
      module2
        file5.module.js
```
In the above example there are two modules: `module1` and `module2`. The first one consists of three files:
```
modules/module1.module.js
client/modules/module1/file3.module.js
client/modules/module1/file4.module.html
```
and the second one:
```
modules/module2/file1.module.js
modules/module2/file2.module.js
client/modules/module2/file5.module.js
```
If you're a package author, then you can specify the module name by passing `module` property along with `options` argument for `addFiles` routine.

In any of the module files there is a special global variable - an `UpperCamelCase` version of your module name - which represents a module instance. Anything you do with this variable will be reflected to each module instance you will ever decide to create. For example:
```javascript
// modules/module1.module.js
Module1.version = "1.0.0";
```
will result in adding `version` property to every instance of `module1`. Additionally the global `Template` object is replaced by a sandboxed version. So within a `.module.js` file belonging to `module1` the `Template` will only contain templates which were defined for this particular module.

### Creating module instances

You can create as many instances of existing modules as you want as long as you make sure that the names of your instances are globally unique.
```javascript
instance1 = Module('module1').as('instance1');
instance2 = Module('module1').as('instance2');
instance3 = Module('module1').as('instance2'); // this will throw an error
```


Notes for updating to Meteor 0.9.0
----------------------------------

This package is now called `anti:modules`.



# meteor-modules

A simple solution for asynchronous modules download.

## Instalation

```
meteor add anti:modules
```

## Basic usage

Put the code of your modules in a folder visible for both server and client. For example:

```
meteorApp
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

Note that due to the way the meteor bundler works, the extensions of your module files need to be changed to `.module.js` and `.module.html` (`.module.css` is not suported yet). To download and execute the module code on the client, use

```javascript
myApp = Module('$global').as('myApp');

myApp.require('layer1', function () {
  console.log('layer1 is now ready to use');
});
```

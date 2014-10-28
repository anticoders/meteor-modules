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

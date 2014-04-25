# meteor-modules

A simple solution for asynchronous modules download.

## Instalation

```
mrt add modules
```

## Basic usage

Put the code of your modules in a folder visible for both server and client. So e.g.

```
meteorApp
  client
    regularFile.js
    ...
  server
  modules
    module1
      file1.module_js
      file2.module_html
    module2
      file3.module_js
      file4.module_html
```

Note that due to the way the meteor bundler works, the extensions of your module files need to be changed to `.module.js` and `.module.html` (`.module.css` is not suported for the moment). To download and execute the module code on the client, use

```javascript
require('module1', function () {
  console.log('module1 is now ready to use');
});
```

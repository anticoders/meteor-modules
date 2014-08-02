var $module = require('$module');

$module.define('someFeature', function () {
  return {
    sayHi: function () {
      console.log('Hi, this is ' + settings.__name__);
    }
  }
});
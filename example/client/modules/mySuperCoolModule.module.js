MySuperCoolModule.subscribe('documents');

require('someFeature', function (feature) {
  feature.sayHi();
});

Template.home.helpers({
  saySomethingAboutYourself: function () {
    return 'This is an instance of module ' + settings.__module__ + '. My name is ' + settings.__name__ + '.';
  }
});

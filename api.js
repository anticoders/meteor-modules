
// how the API could work

module = function (name) {

}

// these guys need to be loaded before everything

module('blog').depend([
  'triggers',
  'actions',
  'router',
]);

// this part of code will be loaded instantly, on both server and client

module('blog').define(function (Blog, settings, i18n) {

});

// this code will be loaded on demand

module('blog').define('editor', [], function () {
  // only admin will require this one

});

module('blog').widget('recent', [], function (Blog, settings, i18n) {

  // template goes here (?)
  Blog.widget.recent

});

// this will be loaded as soon as the blog module is required

module('blog').extend(function (Blog, settings, i18n) {

  Blog.router(function () {
    this.route({
      path: '/edit',
      waitOn: function () {
        return Blog.require('editor');
      },
    });
  });

});


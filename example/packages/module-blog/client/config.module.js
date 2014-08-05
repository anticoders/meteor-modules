/*
  TODO:
  Merge with subscription channels to take advantage of the waitOn param.
*/

_.defaults(settings, {
  articlePath: '/article',
});

settings.routes = settings.routes || {};

_.each([ 'home', 'list', 'dashboard', 'new', 'edit', 'article' ], function (routeName) {
  settings.routes[routeName] = settings.routes[routeName] || {};
});

/*
  Notice: to have it fully loadable (allow to load several instances of the same module
  with different names), we need the following things:

  - Field inside db marking to which module the document belongs,
  - Pass module name to all templates as data, and
  - Use the module name in an updated `path_for` helper.

*/

//Panels.Content.moduleBulbs.push({
//  title: 'Blog',
//  name: 'm:blog',
//  url: '/content' + settings.path,
//  icon: 'th-list',
//});

Blog.router(function () {

  /*
    Todo: instead, create a separate file for managing home path and redirect it to a given path.
  */

  if(settings.home) {
    this.route('home', {
      path: '/',
      template: 'list',
      layoutTemplate: settings.routes.home.layoutTemplate,
    });
  }

  this.route('list', {
    path: '/list',
    template: 'list',
    layoutTemplate: settings.routes.list.layoutTemplate,
  });

  this.route('dashboard', {
    path: '/dashboard',
    template: 'dashboard',
    layoutTemplate: settings.routes.dashboard.layoutTemplate,
    data: {impact: {
      //bulbs: Panels.Content.bulbs,
      bulb: 'm:blog',
    }},
  });

  this.route('new', {
    path: '/edit',
    action: function() {
      var _id = Blog.Articles.insert({});
      _.defer(function() {
        Blog.go('edit', {_id: _id});
      });
    },
    // template: 'edit',
    // layoutTemplate: settings.routes.new.layoutTemplate,
    // data: function() { return {
    //   create: true,
    // };},
  });

  this.route('edit', {
    path: '/edit/:_id',
    template: 'edit',
    layoutTemplate: settings.routes.edit.layoutTemplate,
    data: function() {
      return {
        article: Blog.Articles.findOne({_id: this.params._id}),
      };
    },
  });

  this.route('article', {
    path: settings.articlePath + '/:seo/:_id',
    template: 'article',
    layoutTemplate: settings.routes.article.layoutTemplate,
    yieldTemplates: {
      'articleToEdit': {to: 'top'},
    },
    data: function() {
      return {
        article: Blog.Articles.findOne(this.params._id),
      };
    },
  });

});


MyModule = Module('mySuperCoolModule').as('myModule', {});

MyBlog = Module('blog').as('blog', {
  home: true,
  routes: {
    'home': {
      layoutTemplate: 'panelsLayout'
    },
    'list': {
      layoutTemplate: 'panelsLayout'
    },
    'dashboard': {
      layoutTemplate: 'adminLayout'
    },
    'new': {},
    'edit': {
      layoutTemplate: 'zenLayout'
    },
    'article': {
      layoutTemplate: 'panelsLayout'
    },
  },
});

$global = Module('$global').as('myApp');


Router.onBeforeAction('loading');
Router.configure({
  loadingTemplate: 'loading'
});

Router.map(function () {

  this.route('home', {
    path: '/',
  });

  this.route('myModule_dashboard', {
    path: '/dashboard',
    waitOn: function () {
      return MyModule.require(['dashboard']);
    },
  })

});



UI.registerHelper('myModuleHome', function () {
  return MyModule.Template.home;
});

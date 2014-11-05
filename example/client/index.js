
Router.onBeforeAction('loading');

Router.configure({
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: '/home',
  waitOn: function () {
    return MyModule;
  },
});

Router.route('/dashboard', {
  name: 'dashboard',
  template: 'myModule_dashboard',
  waitOn: function () {
    return MyModule.require(['dashboard']);
  },
});

UI.registerHelper('myModuleHome', function () {
  return MyModule.Template.home;
});

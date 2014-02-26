// this should be done automatically :P
Router.map(function () {

  this.route('modules', {
    path  : '/modules/:name?',
    where : 'server',
  });

});

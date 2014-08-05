
Blog.registerHelper('date', function(date){
  if(!date) return 'never';
  return moment(date).format('DD MMM YYYY');
});

Blog.registerHelper('admin', Template.__create__('admin', function(options) {
  var view = this;
  if (Meteor.user() && Meteor.user().admin) {
    return view.templateContentBlock;
  }
  return view.templateElseContentBlock;
}));

Blog.registerHelper('user', Template.__create__('user', function(options) {
  var view = this;
  if (Meteor.userId()) {
    return view.templateContentBlock;
  }
  return view.templateElseContentBlock;
}));

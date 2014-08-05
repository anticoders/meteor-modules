
/*
  TODO: user roles and privileges
*/
Blog.Articles.allow({
  insert: function(userId, items) {
    var user = Meteor.users.findOne(userId);
    return (!!user) && user.admin;
  },
  update: function(userId, items, fields, modifier) {
    var user = Meteor.users.findOne(userId);
    // if(!user || !user.admin) return false;
    return (!!user) && user.admin;
    // if()
    // return true;
  },
  remove: function(userId, items) {
    return false;
  }
});

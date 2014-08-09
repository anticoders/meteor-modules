
/*
  TODO:
  For all articles, publish only the title and summary.
  Create a third channel for publishing the current article.
*/

Blog.publish("articles", function() {
  return Blog.Articles.find({published: true});
});

Blog.publish("unpublished", function() {
  var user = Meteor.users.findOne(this.userId);
  if( (!!user) && user.admin ) {
    return Blog.Articles.find({});
  }
  return null;
});

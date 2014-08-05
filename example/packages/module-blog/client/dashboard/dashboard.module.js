

Template.dashboard.articles = function() {
  return Blog.Articles.find({
    // $or: [
      // {published: false},
      // {published: {$exists: false}}
    // ]
  }, {
    sort: {createdAt: -1}
  });
};

Template.dashboard.ensureTitle = function() {
  if(this.title && this.title.length > 0) return this.title;
  return "<UNTITLED>";
};


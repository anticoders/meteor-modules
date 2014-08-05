

/* TODO: unimark instad of markdown */
/* TODO: move this data helper to the configurable router. */
/* TODO: clever pagination based on querystring. */
Template.list.articles = function() {
  return Blog.Articles.find({
    published: true
  }, {
    sort: {createdAt: -1}
  });
};




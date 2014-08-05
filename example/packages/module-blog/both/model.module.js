
/*
  title         // string
  seo           // string
  summary       // markdown
  content       // unimark
  published     // boolean

  createdAt     // moment
  publishedAt   // moment
  updatedAt     // moment
*/
Blog.Articles = Blog.collection('articles', {
  
  // transform: function(article) {
  //   article.seo = Utils.clean(article.title);
  //   return article;
  // },

});



if (!process.env.FAKE) return;

/* TODO: why is the count checked twice? Decide on the pattern and leave just one method. */
if (Blog.Articles.findOne({})) return;

console.log("FAKING MODULE: BLOG");

var randomLine = function() {
  return Fake.sentence();
};

var randomText = function(n) {
  var result = '';
  _.times(n, function() {
    result += Fake.paragraph();
    result += '\n\n\n\n';
  });
  return result;
};

var randomSeo = function() {
  return (Fake.word() + '-' + Fake.word() + '-' + Fake.word()).toLowerCase();
};


if (Blog.Articles.find({}).count() < 40) {
  _.times(20, function() {
    Blog.Articles.insert({
      title: randomLine(),
      seo: randomSeo(),
      summary: randomLine() + ' ' + randomLine(),
      content: randomText(15),
      published: true,

      createdAt: moment().valueOf(),
      publishedAt: moment().valueOf(),
      updatedAt: moment().valueOf(),
    });
  });
  _.times(5, function() {
    Blog.Articles.insert({
      title: randomLine(),
      seo: randomSeo(),
      summary: randomLine() + '. ' + randomLine() + '.',
      content: randomText(15),
      published: false,

      createdAt: moment().valueOf(),
      publishedAt: false,
      updatedAt: moment().valueOf(),
    });
  });
}

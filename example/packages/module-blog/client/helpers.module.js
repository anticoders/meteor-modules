
Blog.registerHelper('date', function(date){
  if(!date) return 'never';
  return moment(date).format('DD MMM YYYY');
});

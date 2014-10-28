
WebApp.connectHandlers.stack.splice (0, 0, {
  route: '/modules', // TODO: make it configurable
  handle: Meteor.bindEnvironment(function(req, res, next) {
    
    var path = req.url.match(/[^?]*/)[0].split('/');

    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(Module(path[1]).compile(path[2]));

  }),
});


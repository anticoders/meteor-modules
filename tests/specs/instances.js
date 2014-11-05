describe('Instances', function () {

  it('should be able to instantiate a previously defined module', function (done, server) {
    
    server.eval(function () {
      emit('done', Meteor.release);
    });

    server.once('done', function (release) {
      console.log(release);
      done();
    });

  });

});

describe('benchmark test suite', function () {
  it('should just work', function (done, server) {

    server.eval(function () {
      emit('done', Meteor.release);
    });

    server.once('done', function (release) {
      console.log(release);
      done();
    });

  });
});

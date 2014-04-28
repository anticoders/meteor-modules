// this code will go to both client and server
module('mySuperModule').depend([
  '$client', 'namespace', 'router',
]).extend(function (instance, settings) {
  instance.router(function () {
    this.route();
    this.route();
  });
});

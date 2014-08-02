// this code will go to both client and server
Module('mySuperModule').depend([
  '$client', 'namespace', 'router',
]).extend(function (instance, settings) {
  instance.router(function () {
    this.route();
    this.route();
  });
});

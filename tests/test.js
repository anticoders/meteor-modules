#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var path = require('path');

program
  .version(require('./package.json').version)
  .option('-v, --verbose', 'show more logs')
  .option('-t, --timeout <ms>', 'test-case timeout in milliseconds [default: 5000]', 5000)
  .option('-g, --grep <pattern>', 'only run suites matching the given pattern');

// XXX this needs to be in the global context so that
//     the mocha's "it" and "test" could be overwritten by laika
//     see for example: mocha/lib/interfaces/bdd.js#31

laika = {};

program
  .command('laika')
  .description('run laika test suites')
  .action(function () {
    process.chdir(path.resolve(__dirname, '..', 'example'));
    runLaika(this.parent);
  });

program
  .command('unit')
  .description('run unit tests')
  .action(function () {
    runUnitTests(this.parent);
  });

program.parse(process.argv);

function runLaika(options) {
  // DEPENDENCIES:
  // phantomjs
  // mongodb
  // meteor
  //
  // BEFORE RUNNING:
  // before running an istance of mongodb must be spawned locally
  // listening on the default port

  laika = require('./node_modules/laika/bin/_laika');

  laika.run({
    args     : [ path.resolve(__dirname, 'specs') ],
    reporter : 'spec',
    ui       : 'bdd',
    mport    : 27017,
    timeout  : options.timeout,
    verbose  : options.verbose,
    grep     : options.grep,
  });
}

function runUnitTests(options) {

  var Mocha = require('mocha');
  var mocha = new Mocha();

  var done = false;

  mocha.suite.on('pre-require', function (context) {
    console.log(context.getOrCreateModule);
    if (done) return;
    done = true;
    console.log('PRE-REQUIRE');
    require('../module');
    console.log(context.getOrCreateModule);
  });

  fs.readdirSync('unit').forEach(function (file) {
    mocha.addFile(path.join('unit', file));
  });

  mocha.run();
}


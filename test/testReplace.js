var babel = require('babel-core'),
  path = require('path'),
  fs = require('fs'),
  os = require('os'),
  expect = require('expect');

var options = {
  plugins: path.resolve(__dirname, "../src/index.js"),
  extra: {
    "config": [
      './test/config/$ENV.js',
      './test/config/$ENV.json',
      {
        'development': {
          'PRESENT': 'pony',
        },
        'test': {
          'PRESENT': 'ragdoll',
        },
        'production': {
          'PRESENT': 'racecar'
        }
      }

    ]
  }
}


describe('Babel replace config vars test', function() {

  it('replaces config variables from javascript module.export files', function() {
    var result = babel.transform("var url = process.env.URL", options);
    expect(result.code).toContain('var url = "http://local.dev:3000"');
  });

  it('replaces config variables from json', function() {
    var result = babel.transform("var phone = process.env.PHONE", options);
    expect(result.code).toContain('var phone = "PhoneCarrier"');
  });

  it('replaces config variables inline config', function() {
    var result = babel.transform("var present = process.env.PRESENT", options);
    expect(result.code).toContain('var present = "ragdoll"');
  });

});

## Config vars babel plugin

## Getting started

```bash
npm install --save-dev babel-plugin-replace-config-vars
```

## Usage

In `.babelrc` add your configuration options:

```json
// ...
"plugins": [
  "replace-config-vars"
],
"extra": {
    "config": [
    "./config/$ENV.js",
    "./config/$ENV.json",
    {
      "development": {
        "URL": "http://localhost:3000"
      }
    }
  ]
}
```

### Configuration

The "config" keyword is expected to include an array of configuration. Each
entry in the array can be either a `string` or an `object`.

If the entry is a `string`, it is expected to be a path to a file. The file can
either be a JSON file or a javascript file. Replace config vars respects either and simply
does a `require`. If you use a `.js` file, make sure you use `module.exports` on the file
to actually export the variables. See `test/config/test.js` for an example.

If the string contains a `$ENV`, it will be replaced with the current environment
set by `NODE_ENV`. That is, if your process is started like so:

```shell
NODE_ENV=test npm run
```

The above configuration would change the first two entries into `test` resulting in the
files at `./config/test.js` and `./config/test.json` to be loaded.

If the entry is an `object` and it contains a key of the current environment (see above for
example), then it will simply use the hardcoded values.

### Reference options in source

In the source, we can simply reference the variables in our config by prepending them
with the normal node `process.env.`. For instance, to reference the `URL` option
in the config above, assuming our process is running with `NODE_ENV=development`,
then we can use the variable `process.env.URL` in our source and babel will
replace it when it processes it.

```javascript
var url = process.env.URL;
// ...  
```

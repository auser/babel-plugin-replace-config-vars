## Config vars babel plugin

## Getting started

```bash
npm install --save-dev babel-plugin-replace-config-vars
```

## Usage

In `.babelrc`:

```json
// ...
"plugins": [
  "replace-config-vars"
],
"extra": {
  "config": {
    "directory": "./config"
  }
}
```

Make a file for your environment:

```json
// in config/development.json
{
  "URL": "http://example.api.com"
}
```

When you run the application, the environment is read off from the standard `NODE_ENV` environment variable. To swtich between environments, set this variable:

```bash
$ NODE_ENV=staging npm run
```

And in your source, reference it using the standard `process.env.URL`

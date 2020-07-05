# @esc_games/esc-controller-build-configurator

This is a tool which provides a standard webpack configuration for all ESC controllers.

## Usage

From within your `webpack.config.js` file, import the configurator, call it and provide your root build directory, and the ESD Controller SDK version:


```webpack.config.js
const packageLockJson = require("./package-lock.json");
const escSdkVersion = packageLockJson.dependencies["@esc_games/esc-controller-sdk"].version;

module.exports = require("@esc_games/esc-controller-build-configurator")(__dirname, escSdkVersion);
```

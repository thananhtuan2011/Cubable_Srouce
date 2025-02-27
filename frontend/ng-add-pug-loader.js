/**
 * Adds the pug-loader inside Angular CLI's webpack config, if not there yet.
 * @see https://github.com/danguilherme/ng-cli-pug-loader
 */
const fs = require('fs');
const commonCliConfig = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/common.js';
const pugRules = ` { test: /\.(pug|jade)$/, exclude: /\.(include|partial)\.(pug|jade)$/, use: [ { loader: 'apply-loader' }, { loader: 'pug-loader' } ] }, { test: /\.(include|partial)\.(pug|jade)$/, loader: 'pug-loader' },`;

fs.readFile(commonCliConfig, (err, data) => {
  if (err) throw err;

  const configText = data.toString();
  // make sure we don't add the rule if it already exists
  if (configText.indexOf(pugRules) > -1) { return; }

  // Insert the pug webpack rule
  const position = configText.indexOf('rules: [') + 8;
  const output = [configText.slice(0, position), pugRules, configText.slice(position)].join('');
  const file = fs.openSync(commonCliConfig, 'r+');
  fs.writeFile(file, output, error => {
    if (error)
      console.error("An error occurred while overwriting Angular CLI's Webpack config");

    fs.close(file, () => {});
  });
});

/**
 * Set's directTemplateLoading: false to allow custom pug template loader to work
 * @see https://github.com/angular/angular-cli/issues/14534
 */
const ivyPluginCliConfig = 'node_modules/@ngtools/webpack/src/ivy/plugin.js';

fs.readFile(ivyPluginCliConfig, (err, data) => {
  if (err) { throw err; }

  const ivyPluginText = data.toString();
  
  // update the setting
  const output = ivyPluginText.replace('directTemplateLoading: true,', 'directTemplateLoading: false,');

  // rewrite the file
  const file2 = fs.openSync(ivyPluginCliConfig, 'r+');
  fs.writeFile(file2, output, error => {
    if (error)
      console.error("An error occurred while overwriting Angular CLI's Webpack config");

    fs.close(file2, () => {});
  });
});

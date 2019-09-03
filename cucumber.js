
let common = [
    'test/features/**/*.feature', // Specify our feature files
    '--require-module ts-node/register', // Load TypeScript module
    '--require test/steps/**/*.ts', // Load step definitions
    '-f json:build/test-results/cucumber_report.json',
    '--format progress-bar', // Load custom formatter
    '--format node_modules/cucumber-pretty', // Load custom formatter
    '--tags "not @ignore"'
].join(' ');

module.exports = {
    default: common
};

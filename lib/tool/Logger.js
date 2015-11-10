/**
 * @author zhangpeng
 * @date 15/10/31-下午12:38
 * @file Logger
 */

// node_modules
var bunyan = require('bunyan');

var appName = 'ejs-extension-plus';
var logger = bunyan.createLogger({
    name: appName,
    streams: [{
        level: 'trace',
        stream: process.stdout
    }]
});

logger.info({streamLevels: logger.levels()}, appName + ' Logger initialized.');

module.exports = function (moduleName) {
    return logger.child({module: appName + ':' + moduleName});
};

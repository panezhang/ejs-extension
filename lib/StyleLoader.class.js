/**
 * @author zhangpeng
 * @date 15/10/2-下午7:40
 * @file StyleLoader
 */

// node_modules
var _ = require('underscore');

// system modules
var fs = require('fs');
var path = require('path');


function StyleLoader(resLocals, Resource) {
    if (!(this instanceof StyleLoader)) return new StyleLoader(resLocals);
    this.logger = Resource.LoggerCreate(__filename);
}

_.extend(StyleLoader.prototype, {
    outputStyles: function (stylePaths, merge) {
        var self = this;
        var output = '';
        var stylePath = '';
        _.chain(stylePaths).unique().each(function (stylePath) {
            self.logger.trace('stylePath: ' + stylePath);
            if (stylePath) {
                if (merge) {
                    output += fs.readFileSync(path.resolve('./output' + stylePath));
                } else {
                    output += '<link rel="stylesheet" media="screen" href="' + stylePath + '" />';
                }
            }
        });
        if (merge && output) {
            output = '<style>' + output + '</style>';
        }
        // self.logger.trace('styles: ' + output);
        return output;
    }
});

module.exports = StyleLoader;

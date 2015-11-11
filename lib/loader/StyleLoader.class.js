/**
 * @author zhangpeng
 * @date 15/10/2-下午7:40
 * @file StyleLoader
 */

// node_modules
var _ = require('underscore');

// system modules
var fs = require('fs');


function StyleLoader(resLocals, Resource) {
    if (!(this instanceof StyleLoader)) return new StyleLoader(resLocals);
    this.logger = Resource.LoggerCreate(__filename);
}

_.extend(StyleLoader.prototype, {
    outputStyles: function (stylePathList, merge) {
        var self = this;
        var output = '';
        _.chain(stylePathList).unique().each(function (stylePath) {
            self.logger.trace('stylePath: ' + stylePath);
            if (stylePath) {
                if (merge) {
                    output += (fs.readFileSync(stylePath) + '\n');
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

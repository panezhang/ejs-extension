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

    var self = this;
    self.logger = Resource.LoggerCreate(__filename);
    self.PathTool = Resource.PathTool;
    self.styleList = [];

    _.extend(resLocals, {
        load_style: function (path) {
            var foundPath = self.PathTool.findLibStyle(path);
            if (foundPath) {
                self.styleList.push(foundPath);
            } else {
                self.logger.warn('style:%s not found!', path);
            }
        }
    });
}

_.extend(StyleLoader.prototype, {
    outputStyles: function (stylePathList, merge) {
        var self = this;

        // 处理load_script加载的lib script
        var libOutput = '';
        _.chain(self.styleList).unique().each(function (stylePath) {
            self.logger.trace('stylePath: ' + stylePath);
            if (stylePath) {
                libOutput += '<link rel="stylesheet" media="screen" href="' + stylePath + '" />';
            }
        });
        self.logger.trace('libOutput: ' + libOutput);
        
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
        return libOutput + output;
    }
});

module.exports = StyleLoader;

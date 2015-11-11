/**
 * @author zhangpeng
 * @date 15/10/3-上午3:19
 * @file Layout类, 每个对象代表一个layout
 */

// node_modules
var _ = require('underscore');
var ejs = require('ejs');

// system modules
var path = require('path');

module.exports = function (Resource) {
    var logger = Resource.LoggerCreate(__filename);
    var FileLoader = Resource.FileLoader;
    var PathTool = Resource.PathTool;

    function Layout(moduleName, layoutName) {
        if (!(this instanceof Layout)) return new Layout(moduleName, layoutName);

        this.layoutID = PathTool.genLayoutID(moduleName, layoutName);
        this.layoutTemplate = PathTool.findTemplate(this.layoutID);
        logger.trace('Layout ID :', this.layoutID);
        logger.trace('Layout template:', this.layoutTemplate);
    }

    _.extend(Layout.prototype, {
        loadTemplate: function (data) {
            var self = this;
            var layoutHtml = FileLoader.load(self.layoutTemplate);
            if (layoutHtml) {
                layoutHtml = ejs.render(layoutHtml, data);
                // logger.trace('Layout Html rendered:', layoutHtml);
            } else {
                logger.warn('Layout <%s> template <%s> not found!', self.layoutID, self.layoutTemplate);
            }
            return layoutHtml;
        },

        scriptPath: function () {
            var self = this;
            var path = PathTool.findScript(self.layoutID);
            logger.trace('Layout scriptPath:', path);
            return path;
        },

        stylePath: function () {
            var self = this;
            var path = PathTool.findStyle(self.layoutID);
            logger.trace('Layout stylePath:', path);
            return path;
        }
    });

    return Layout;
};

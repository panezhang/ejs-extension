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
    var FileLoader = Resource.FileLoader;
    var pathTool = Resource.PathTool;
    var logger = Resource.LoggerCreate(__filename);

    function Layout(moduleName, layoutName) {
        if (!(this instanceof Layout)) return new Layout(moduleName, layoutName);

        
        this.layoutID = pathTool.genLayoutID(moduleName, layoutName);
        this.layoutTemplate = pathTool.findTemplate(this.layoutID);
        logger.trace('Layout ID :', this.layoutID);
        logger.trace('Layout template:', this.layoutTemplate);
    }

    _.extend(Layout.prototype, {
        loadTemplate: function (data) {
            var self = this;
            var layoutHtml = FileLoader.load(this.layoutTemplate);
            if (layoutHtml) {
                layoutHtml = ejs.render(layoutHtml, data);
                // logger.trace('Layout Html rendered:', layoutHtml);
            } else {
                logger.trace('Layout template <' + this.layoutTemplate + '> not found!');
            }
            return layoutHtml;
        },

        scriptPath: function () {
            var self = this;
            var path = pathTool.findScript(this.layoutID);
            logger.trace('Layout scriptPath:', path);
            return path;
        },

        stylePath: function () {
            var self = this;
            var path = pathTool.findStyle(this.layoutID);
            logger.trace('Layout stylePath:', path);
            return path;
        }
    });

    return Layout;
};

/**
 * @author zhangpeng
 * @date 15/10/3-上午3:19
 * @file Widget类
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

    function Widget(module, widgetName, LoggerCreate) {
        if (!(this instanceof Widget)) return new Widget(module, widgetName);

        this.widgetID = PathTool.genWidgetID(module, widgetName);
        this.widgetTemplate = PathTool.findTemplate(this.widgetID);
        logger.trace('Widget ID:', this.widgetID);
        logger.trace('Widget Template:', this.widgetTemplate);
    }

    _.extend(Widget.prototype, {
        loadTemplate: function (data) {
            var self = this;
            var widgetHtml = FileLoader.load(self.widgetTemplate);
            if (widgetHtml) {
                widgetHtml = ejs.render(widgetHtml, data);
                // logger.trace('Widget Html rendered:', widgetHtml);
            } else {
                logger.trace('Widget <%s> template <%s> not found!', self.widgetID, self.widgetTemplate);
            }
            return widgetHtml;
        },

        scriptPath: function () {
            var self = this;
            var path = PathTool.findScript(self.widgetID);
            logger.trace('Widget scriptPath:', path);
            return path;
        },

        stylePath: function () {
            var self = this;
            var path = PathTool.findStyle(self.widgetID);
            logger.trace('Widget stylePath:', path);
            return path;
        }
    });

    return Widget;
};

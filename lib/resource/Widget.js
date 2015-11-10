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
    var FileLoader = Resource.FileLoader;
    var pathTool = Resource.PathTool;
    var logger = Resource.LoggerCreate(__filename);

    function Widget(module, widgetName, LoggerCreate) {
        if (!(this instanceof Widget)) return new Widget(module, widgetName);

        this.widgetID = pathTool.genWidgetID(module, widgetName);
        this.widgetTemplate = pathTool.findTemplate(this.widgetID);
        logger.trace('Widget ID:', this.widgetID);
        logger.trace('Widget Template:', this.widgetTemplate);
    }

    _.extend(Widget.prototype, {
        loadTemplate: function (data) {
            var widgetHtml = FileLoader.load(this.widgetTemplate);
            if (widgetHtml) {
                widgetHtml = ejs.render(widgetHtml, data);
                // logger.trace('Widget Html rendered:', widgetHtml);
            } else {
                logger.trace('Widget template <' + this.widgetTemplate + '> not found!');
            }
            return widgetHtml;
        },

        scriptPath: function () {
            var path = pathTool.findScript(this.widgetID);
            logger.trace('Widget scriptPath:', path);
            return path;
        },

        stylePath: function () {
            var path = pathTool.findStyle(this.widgetID);
            logger.trace('Widget stylePath:', path);
            return path;
        }
    });

    return Widget;
};

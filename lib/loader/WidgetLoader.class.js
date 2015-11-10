/**
 * @author zhangpeng
 * @date 15/10/2-下午7:35
 * @file WidgetLoader在res.locals中添加widget相关函数
 */

// node_modules
var _ = require('underscore');
// system modules
var path = require('path');
// our modules

function WidgetLoader(resLocals, defaultModule, Resource) {
    if (!(this instanceof WidgetLoader)) return new WidgetLoader(resLocals, defaultModule, Resource);

    var self = this;
    self.logger = Resource.LoggerCreate(__filename);
    var Widget = Resource.Widget;
    self.widgetList = [];
    var TemplateHelper = Resource.TemplateTool;

    var renderWidget = function (widgetName, data, moduleName) {
        self.logger.trace('rendering, module:%s, widget:%s ', moduleName, widgetName);
        var widget = new Widget(moduleName, widgetName);
        self.widgetList.push(widget);
        data = {data: data || {}};    // 封装data
        data = _.isEmpty(data) ? resLocals : _.defaults(data, resLocals);
        return widget.loadTemplate(data);
    };

    _.extend(resLocals, {
        current_module: defaultModule,

        load_widget: function (widgetName, data, moduleName) {
            if (widgetName === undefined) {
                return '';
            }

            // support moduleName as second param
            if (moduleName === undefined && typeof data === 'string') {
                moduleName = data;
                data = undefined;
            }

            if (moduleName === undefined) {
                // 未指定模块时默认渲染当前模块下widget
                moduleName = resLocals.current_module;
                return renderWidget(widgetName, data, moduleName);
            } else {
                // 跨模块渲染, 在指定模块下完成widget渲染, 完成后切换回原模块
                var lastModule = resLocals.current_module;
                self.logger.trace('set current module from:%s to:%s', resLocals.current_module, moduleName);
                resLocals.current_module = moduleName;
                var html = renderWidget(widgetName, data, moduleName);
                self.logger.trace('set current module from:%s to:%s', resLocals.current_module, lastModule);
                resLocals.current_module = lastModule;
                return html;
            }
        }
    });
}

_.extend(WidgetLoader.prototype, {
    /**
     * @return {Array} 需要加载的脚本路径的数组
     */
    scripts: function () {
        return _.map(this.widgetList, function (widget) {
            return widget.scriptPath();
        });
    },

    /**
     * @return {Array} 需要加载的样式路径的数组
     */
    styles: function () {
        return _.map(this.widgetList, function (widget) {
            return widget.stylePath();
        });
    }
});

module.exports = WidgetLoader;

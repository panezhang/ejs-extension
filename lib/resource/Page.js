/**
 * @author zhangpeng
 * @date 15/10/3-上午3:16
 * @file 渲染指定页面
 */

// node_modules
var _ = require('underscore');

// system modules
var fs = require('fs');
var path = require('path');

// our modules
var LayoutLoader = require(path.join(__dirname, '..', 'loader', 'LayoutLoader.class'));
var WidgetLoader = require(path.join(__dirname, '..', 'loader', 'WidgetLoader.class'));
var ScriptLoader = require(path.join(__dirname, '..', 'loader', 'ScriptLoader.class'));
var StyleLoader = require(path.join(__dirname, '..', 'loader', 'StyleLoader.class'));


module.exports = function (Resource) {
    var logger = Resource.LoggerCreate(__filename);
    var PathTool = Resource.PathTool;
    var TemplateHelper = Resource.TemplateTool;
    var Conf = Resource.Conf;

    var useMinJs = Conf.useMinJs;
    var whiteListJs = Conf.whiteListJs;
    var useMinCss = Conf.useMinCss;
    var whiteListCss = Conf.whiteListCss;

    function Page(module, pageName) {
        if (!(this instanceof Page)) return new Page(module, pageName);

        var pageID = PathTool.genPageID(module, pageName);
        var pageTemplate = PathTool.findTemplate(pageID);
        logger.trace('Page Template:', pageTemplate);
        this.pageID = pageID;
        this.module = module;

        // 确保模板文件存在
        if (fs.existsSync(pageTemplate)) {
            // 真实的模板文件名，供res.render使用
            this.pageRenderID = pageTemplate.substring(pageTemplate.indexOf(pageID), pageTemplate.length - TemplateHelper.settings.tplExt.length);
        } else {
            this.pageRenderID = this.pageID;
            logger.error('Page Template <' + pageTemplate + '> does not exist.');
        }

        logger.trace('PageID:', this.pageRenderID);
    }

    _.extend(Page.prototype, {
        // 渲染page
        render: function (res, options, callback) {
            var self = this;
            var req = res.req;
            var done = callback;
            var opts = options || {};
            // 函数参数处理
            // support callback function as second arg
            if (typeof opts === 'function') {
                done = opts;
                opts = {};
            }
            // default callback to respond
            done = done || function (err, str) {
                if (err) return req.next(err);
                res.send(str);
            };

            // 所有对res.locals的处理
            var widgetLoader = new WidgetLoader(res.locals, this.module, Resource);
            var layoutLoader = new LayoutLoader(res.locals, this.module, Resource);
            var scriptLoader = new ScriptLoader(res.locals, Resource);
            var styleLoader = new StyleLoader(res.locals, Resource);

            logger.trace(res.locals);
            res.render(this.pageRenderID, {data: opts}, function (err, html) {
                if (err) {
                    return req.next(err);
                }
                if (html) {
                    // 先渲染layout中的块
                    html = layoutLoader.render(html);

                    // 输出脚本和样式
                    var scripts = layoutLoader.scripts().concat(widgetLoader.scripts()).concat([self.scriptPath()]);
                    var styles = layoutLoader.styles().concat(widgetLoader.styles()).concat([self.stylePath()]);

                    // var nestedScriptHtml = scriptLoader.outputNestedScriptsOld(html);
                    var result = scriptLoader.outputNestedScripts(html);
                    var nestedScriptHtml = result.script;
                    html = result.html;
                    var scriptHtml = scriptLoader.outputScripts(scripts, Conf.mergeJs);
                    var styleHtml = styleLoader.outputStyles(styles, Conf.mergeCss);

                    // 移除scriptLoader的注释
                    // html = scriptLoader.removeAnnotation(html);
                    html = TemplateHelper.appendToHeadBottom(html, styleHtml);
                    html = TemplateHelper.appendToBodyBottom(html, scriptHtml + nestedScriptHtml);
                    
                    // 替换.js文件为min.js
                    if (useMinJs) {
                        html = scriptLoader.replaceWithMin(html, 'js', whiteListJs);
                    }
                    if (useMinCss) {
                        html = scriptLoader.replaceWithMin(html, 'css', whiteListCss);
                    }
                }
                if (done) {
                    done(err, html);
                }

                logger.info('finish rendering page: ', self.pageID);
            });
        },

        scriptPath: function () {
            var path = PathTool.findScript(this.pageID);
            logger.trace('Page scriptPath:', path);
            return path;
        },

        stylePath: function () {
            var path = PathTool.findStyle(this.pageID);
            logger.trace('Page stylePath:', path);
            return path;
        }
    });

    return Page;
};

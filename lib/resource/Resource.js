/**
 * @author zhangpeng
 * @date 15/10/3-上午4:27
 * @file 初始化PathTool工具和Page, Widget, Layout类
 */

// node_modules
var _ = require('underscore');

// system modules
var path = require('path');

module.exports = function (opts) {
    var FileLoader = require(path.join(__dirname, 'FileLoader'))(opts.LoggerCreate);
    var TemplateTool = require(path.join(__dirname, 'TemplateTool'))(opts.extConf);
    var PathTool = require(path.join(__dirname, 'PathTool'))(opts, FileLoader, TemplateTool);

    var Resource = {
        PathTool: PathTool,
        FileLoader: FileLoader,
        TemplateTool: TemplateTool,

        Conf: opts.conf,
        LoggerCreate: opts.LoggerCreate
    };

    _.extend(Resource, {
        Page: require(path.join(__dirname, 'Page'))(Resource),
        Widget: require(path.join(__dirname, 'Widget'))(Resource),
        Layout: require(path.join(__dirname, 'Layout'))(Resource)
    });

    return Resource;
};

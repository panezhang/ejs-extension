/**
 * @author zhangpeng
 * @date 15/10/3-上午4:27
 * @file 初始化PathTool工具和Page, Widget, Layout类
 */

// node_modules
var _ = require('underscore');

// system modules
var path = require('path');

module.exports = function (webRootPath, templateFolder, staticFolder, map, Conf, LoggerCreate) {
    var fileLoader = require(path.join(__dirname, 'FileLoader'))(LoggerCreate);
    var pathTool = require(path.join(__dirname, 'PathTool'))(webRootPath, templateFolder, staticFolder, fileLoader, map, LoggerCreate);
    var Resource = {
        PathTool: pathTool,
        FileLoader: fileLoader,
        Conf: Conf,
        LoggerCreate: LoggerCreate
    };
    _.extend(Resource, {
        Page: require(path.join(__dirname, 'Page'))(Resource),
        Widget: require(path.join(__dirname, 'Widget'))(Resource),
        Layout: require(path.join(__dirname, 'Layout'))(Resource)
    });

    return Resource;
};

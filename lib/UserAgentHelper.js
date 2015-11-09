/**
 * @author zhangpeng
 * @date 15/10/9-下午2:54
 * @file UserAgentHandler
 */

// node_modules
var parser = require('ua-parser-js');

// system modules

// our modules
var YqgAgent = 'Yqg/';

module.exports = function (LoggerCreate) {
    var logger = LoggerCreate(__filename);

    return function (req, res) {
        var ua = parser(req.headers['user-agent']);
        var osName = (ua.os.name && ua.os.name.toLowerCase()) || '';

        var isWebView = (req.query.webview !== undefined) || ua.ua.indexOf(YqgAgent) > -1;
        var isIos = osName.indexOf('ios') > -1;
        var isAndroid = osName.indexOf('android') > -1;
        var isWeiXin = ua.ua.toLowerCase().indexOf('micromessenger') > -1;

        var isPhone = isWebView || isIos || isAndroid;
        var isPC = !isPhone;

        var uaIdentity = {
            isWebView: isWebView,
            isIos: isIos,
            isAndroid: isAndroid,
            isWeiXin: isWeiXin,
            isPhone: isPhone,
            isPC: isPC
        };

        logger.info({uaIdentity: uaIdentity}, 'AgentHelper');

        res.locals.AgentHelper = {
            // 是否在洋钱罐客户端中通过webview展示
            isWebView: function () {
                return isWebView;
            },
            isIos: function () {
                return isIos;
            },
            isAndroid: function () {
                return isAndroid;
            },
            isWeiXin: function () {
                return isWeiXin;
            },
            isPhone: function () {
                return isPhone;
            },
            isPC: function () {
                return isPC;
            },

            // 用来判断UA的一致性, 并保存不同版本的cache
            uaIdentity: uaIdentity
        };
    }
};

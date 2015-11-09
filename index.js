/**
 * @author zhangpeng
 * @date 2015-10-02
 * @file 扩展ejs模板，增加layout和widget相关功能
 *
 * layout实现：在layout中通过特殊标记留坑，在template中标记各个坑对应的块，然后在res.render的callback中去填坑
 * widget实现：load_widget时输出html并保存js,css路径，然后在res.render的callback中填充js,css
 */

// system modules
var path = require('path');

module.exports = function (webRootPath, templateFolder, staticFolder, map, Conf, constantObj, LoggerCreate) {
    var logger = LoggerCreate('template-extension');

    var Resource = require(path.join(__dirname, 'lib', 'Resource'))(webRootPath, templateFolder, staticFolder, map, Conf, LoggerCreate);
    var Page = Resource.Page;
    var ConstantsHelper = require(path.join(__dirname, 'lib', 'Constants'))(constantObj, LoggerCreate);
    var FunctionsHelper = require(path.join(__dirname, 'lib', 'Functions'))(LoggerCreate);
    var UserAgentHelper = require(path.join(__dirname, 'lib', 'UserAgentHelper'))(LoggerCreate);
    var PageCache = require(path.join(__dirname, 'lib', 'PageCache'))(LoggerCreate);

    var userPageCache = Conf.usePageCache;

    return function (req, res, next) {
        if (res.renderPage) {
            logger.error('res.renderPage already exists!');
            throw new Error('res.renderPage already exists!');
        }

        res.renderPage = function (view, options, callback) {
            // cache和ua相关, 必须先设置ua
            UserAgentHelper(req, res);

            var uaIdentity = res.locals.AgentHelper.uaIdentity;
            // 先查cache
            var cache = PageCache.read(view, options, uaIdentity);
            if (userPageCache && cache) {
                logger.info({page: view}, 'found cache, won\'t render again');
                res.send(cache);
                return callback && callback(void 0, cache);
            }

            logger.info({page: view}, 'start rendering page');
            if (!view.module || !view.page) {
                throw new Error('res.renderPage must be called as: \nres.render({module: \'moduleName\', page: \'pageName\'}, options, callback)');
            }

            // sub-middleware
            ConstantsHelper(req, res);
            FunctionsHelper(req, res);
            UserAgentHelper(req, res);

            var page = new Page(view.module, view.page);
            page.render(res, options, function (err, str) {
                if (err) return req.next(err);

                res.send(str);
                PageCache.write(view, options, uaIdentity, str);
            });
        };

        next();
    }
};

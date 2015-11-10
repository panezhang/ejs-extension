/**
 * @author zhangpeng
 * @date 2015-10-02
 * @file 扩展ejs模板，增加layout和widget相关功能
 *       extend ejs template system, supporting layout and widget functionalities
 *
 * layout实现：在layout中通过特殊标记留坑，在template中标记各个坑对应的块，然后在res.render的callback中去填坑
 * widget实现：load_widget时输出html并保存js,css路径，然后在res.render的callback中填充js,css
 */

// node modules
var _ = require('underscore');

// system modules
var path = require('path');

/**
 *
 * @param options.webRoot       // required, rootPath
 * @param options.tplDir        // required, template folder path relative to rootPath
 * @param options.staticDir     // static folder path relative to rootPath (js, css)
 * if options.staticDir was not assigned, we would suppose that template files(html) && static files(js, css) are in the same folder,
 * else we would use options.staticDir + templatePath to find static files
 *
 * @param options.map           // map generated by fis3, if using fis3
 * if options.map was assigned, we would use map to find static files
 *
 * @param options.conf          // conf for extension
 * @param options.consts        // global constants used in template
 * @param options.funcs         // global functions used in template
 *
 * @param options.LoggerCreate  // used to output log of this middleware
 *
 * @returns {Function} middleware function
 */
module.exports = function (options) {
    if (!options) throw new Error('options is undefined!');
    if (!options.webRoot) throw new Error('options.webRoot is undefined!');
    if (!options.tplDir) throw new Error('options.tplDir is undefined!');

    var opts = {
        map: {},

        conf: {
            usePageCache: true,
            useMinJs: false,        // whethe to replace .js to .min.js
            whiteListJs: [],        // js that can not be replaced
            useMinCss: false,       // whethe to replace .css to .min.css
            whiteListCss: [],       // css that can not be replaced
            mergeJs: true,         // merge js files in static dir
            mergeCss: true         // merge css files in static dir
        },

        extConf: {
            // 各种类型文件的后缀名
            tplExt: '.html',
            scriptExt: '.js',
            styleExt: '.css'
        },

        consts: {},
        funcs: {},

        LoggerCreate: require(path.join(__dirname, 'lib', 'tool', 'Logger'))
    };

    _.extend(opts, options);

    // init sub middlewares
    var ConstantsHelper = require(path.join(__dirname, 'lib', 'helper', 'Constants'))(opts.consts, opts.LoggerCreate);
    var FunctionsHelper = require(path.join(__dirname, 'lib', 'helper', 'Functions'))(opts.funcs, opts.LoggerCreate);
    var UserAgentHelper = require(path.join(__dirname, 'lib', 'helper', 'UserAgentHelper'))(opts.LoggerCreate);

    var PageCacheHelper = require(path.join(__dirname, 'lib', 'tool', 'PageCache'))(opts.LoggerCreate);
    var Resource = require(path.join(__dirname, 'lib', 'resource', 'Resource'))(opts);
    var Page = Resource.Page;

    var logger = opts.LoggerCreate('template-extension');
    var userPageCache = opts.conf.usePageCache;

    return function (req, res, next) {
        if (res.renderPage) throw new Error('res.renderPage already exists!');

        res.renderPage = function (view, options, callback) {
            // cache和ua相关, 必须先设置ua
            UserAgentHelper(req, res);

            var uaIdentity = res.locals.AgentHelper.uaIdentity;
            // 先查cache
            var cache = PageCacheHelper.read(view, options, uaIdentity);
            if (userPageCache && cache) {
                logger.info({page: view}, 'found cache, won\'t render again');
                res.send(cache);
                return callback && callback(void 0, cache);
            }

            logger.info({page: view}, 'start rendering page');
            if (!view.module || !view.page) throw new Error('res.renderPage must be called as: \nres.render({module: \'moduleName\', page: \'pageName\'}, options, callback)');

            // sub-middleware
            ConstantsHelper(req, res);
            FunctionsHelper(req, res);

            var page = new Page(view.module, view.page);
            page.render(res, options, function (err, str) {
                if (err) return req.next(err);

                res.send(str);
                PageCacheHelper.write(view, options, uaIdentity, str);
            });
        };

        next();
    }
};

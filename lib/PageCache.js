/**
 * @author zhangpeng
 * @date 15/11/5-上午11:20
 * @file PageCache
 */

// node_modules
var _ = require('underscore');
var clone = require('clone');

// system modules

// our modules

module.exports = function (LoggerCreate) {
    var logger = LoggerCreate(__filename);
    var cache = {};

    return {
        /**
         * 针对同一个view, 根据options和uaIdentity来保存不同版本的cache
         * @param view
         * @param options
         * @param uaIdentity
         * @param str
         */
        write: function (view, options, uaIdentity, str) {
            logger.info('try to write cache for: ', view);
            var key = JSON.stringify(view) + JSON.stringify(uaIdentity);
            cache[key] = {
                options: clone(options),
                str: str
            };
            logger.info('write cache success for: ', view);
        },

        /**
         * 根据view判断是否存在options和uaIdentity一致的cache, 存在则返回
         * @param view
         * @param options
         * @param uaIdentity
         */
        read: function (view, options, uaIdentity) {
            logger.info('try to read cache for: ', view);
            var key = JSON.stringify(view) + JSON.stringify(uaIdentity);
            var cachePage = cache[key];
            if (cachePage && _.isEqual(cachePage.options, options)) {
                logger.info('found cache for: ', view);
                return cachePage.str;
            } else {
                logger.info('no cache for: ', view);
                return false;
            }
        }
    }
};

/**
 * @author zhangpeng
 * @date 15/11/5-上午11:20
 * @file PageCache
 */

// node_modules
var _ = require('underscore');

// system modules

// our modules

module.exports = function (opts) {
    var logger = opts.LoggerCreate(__filename);
    var cache = {};
    var maxCopyNum = opts.maxCacheCopyNum;
    var expireTime = opts.maxCacheExpireTime;

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
            var key = genKey(view, uaIdentity);
            var optsKey = JSON.stringify(options);
            var pool;
            var found;

            cache[key] = cache[key] || [];
            pool = cache[key];
            found = _.findWhere(pool, {options: optsKey});
            if (found) {
                found.str = str;
                found.hit = found.hit + 1;
                found.expireStamp = expireTime + new Date().getTime();
            } else {
                pool.push({
                    options: optsKey,
                    str: str,
                    hit: 1,
                    expireStamp: expireTime + new Date().getTime()
                });
            }

            // 按热度排序
            pool.sort(function (left, right) {
                return right.hit - left.hit || right.expireStamp - left.expireStamp;
            });
            while(pool.length > maxCopyNum) {
                pool.pop();
            }
            logger.info({pool: _.map(pool, function (t) {
                return _.pick(t, 'hit', 'expireStamp');
            })}, 'write cache success, current caches for', view);
        },

        /**
         * 根据view判断是否存在options和uaIdentity一致的cache, 存在则返回
         * @param view
         * @param options
         * @param uaIdentity
         */
        read: function (view, options, uaIdentity) {
            logger.info('try to read cache for: ', view);
            var key = genKey(view, uaIdentity);
            var optsKey = JSON.stringify(options);
            var pool = cache[key] || [];
            var found = _.findWhere(pool, {options: optsKey});

            if (found && found.expireStamp > new Date().getTime()) {
                found.hit = found.hit + 1;
                logger.info('total cache copy: %s, found cache for: ', pool.length, view);
                return found.str;
            } else {
                logger.info('no cache for: ', view);
                return false;
            }
        }
    }
};

function genKey(view, uaIdentity) {
    return JSON.stringify(view) + JSON.stringify(uaIdentity);
}

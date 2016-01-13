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
    var deltaHitIgnore = opts.maxDeltaHitIgnore;
    var maxHitIgnore = opts.maxHitIgnore;

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
            // 写入cache
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

            // 调整cache, 优先按热度排序, 热度差小于deltaHitIgnore或热度小于maxHitIgnore时按时间排序
            pool.sort(function (left, right) {
                var deltaHit = right.hit - left.hit;
                var deltaTime = right.expireStamp - left.expireStamp;
                var sortByHit = Math.abs(deltaHit) > deltaHitIgnore && (right.hit > maxHitIgnore || left.hit > maxHitIgnore);
                return sortByHit ? deltaHit : deltaTime;
            });
            while (pool.length > maxCopyNum) {
                pool.pop();
            }
            logger.trace({
                pool: _.map(pool, function (t) {
                    return {
                        hit: t.hit,
                        expireStamp: new Date(t.expireStamp).toLocaleString()
                    };
                })
            }, 'write cache success, current caches for', view);
            logger.info('write cache success, current caches for %j, copies: %s', view, pool.length)
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

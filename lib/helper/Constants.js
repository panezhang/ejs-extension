/**
 * @author zhangpeng
 * @date 15/10/16-下午1:16
 * @file Constants
 */

/**
 * 添加constants到res.locals.global, 在模板中通过<%= global.name %>获取到变量的值
 *
 * add constants to res.locals.global, using <%= global.name %> for value of 'constants.name' in template
 * @param constants
 * @param LoggerCreate
 * @returns {Function} sub middleware
 */
module.exports = function (constants, LoggerCreate) {
    var logger = LoggerCreate(__filename);

    logger.info('Template Constants initialized.');
    return function (req, res) {
        res.locals.global = constants || {};
    }
};

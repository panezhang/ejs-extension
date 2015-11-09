/**
 * @author zhangpeng
 * @date 15/10/16-下午1:16
 * @file Constants
 */

module.exports = function (constants, LoggerCreate) {
    var logger = LoggerCreate(__filename);

    logger.info('Template Constants initialized.');
    return function (req, res) {
        res.locals.global = constants || {};
    }
};

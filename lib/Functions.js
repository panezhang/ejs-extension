/**
 * @author zhangpeng
 * @date 15/10/18-下午5:11
 * @file Functions
 */

// node_modules
var _ = require('underscore');
var moment = require('moment');

/**
 * 用functionExt, 拓展res.locals, 可以在template中直接使用方法<%= dataFormat('xxx') %>
 * @param functionExt
 * @param LoggerCreate
 * @returns {Function}
 */
module.exports = function (functionExt, LoggerCreate) {
    var logger = LoggerCreate(__filename);
    logger.info('Template Functions initialized.');

    return function (req, res) {
        _.extend(res.locals, {
            dateFormat: function (date, format) {
                if (!date) return '';

                return moment(date).format(format);
            },

            numberWithCommas: function (x) {
                if (!x) return 0;

                var parts = x.toString().split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return parts.join('.');
            },

            json: function (obj) {
                return JSON.stringify(obj);
            },

            setTitle: function (obj) {
                var title;
                if (obj.rawTitle) {
                    title = obj.rawTitle;
                } else {
                    title = (obj.title ? obj.title + '-' : '') + res.locals.global.globalTitle;
                }
                return title;
            }
        }, functionExt);
    }
};

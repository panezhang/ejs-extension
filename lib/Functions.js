/**
 * @author zhangpeng
 * @date 15/10/18-下午5:11
 * @file Functions
 */

// node_modules
var _ = require('underscore');
var moment = require('moment');

module.exports = function (LoggerCreate) {
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
            },

            getSEOTxt: function () {
                return [
                    '<meta name="description" content="洋钱罐-致力于为都市白领提供安全稳健、透明高效的全球资产配置服务,已获A股上市公司昆仑万维领投3.1亿元天使融资,并由中国人保提供资金安全保障">',
                    '<meta name="Keywords" content="赚钱,理财,黄金,股票,美股,基金,活期,定期,美元,yqg,yangqianguan,消费金融,网络理财,投资理财,互联网金融,个人理财,信贷,金融,投资">'
                ].join('');
            }
        });
    }
};

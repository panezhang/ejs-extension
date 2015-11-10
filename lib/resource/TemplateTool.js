/**
 * @author zhangpeng
 * @date 15/10/3-上午1:15
 * @file Template辅助函数
 */

module.exports = function (extConf) {
    return {
        settings: extConf,

        // 将txt添加到html<head>底部
        appendToHeadBottom: function (html, txt) {
            return html && html.replace('</head>', txt + '</head>');
        },
        // 将txt添加到html<body>底部
        appendToBodyBottom: function (html, txt) {
            return html && html.replace('</body>', txt + '</body>');
        }
    }
};

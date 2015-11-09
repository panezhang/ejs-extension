/**
 * @author zhangpeng
 * @date 15/10/3-上午1:15
 * @file Template辅助函数
 */

module.exports = {
    settings: {
        // 各种类型文件的后缀名
        tplExt: '.html',
        scriptExt: '.js',
        styleExt: '.less'
    },

    // 将txt添加到html<head>底部
    appendToHeadBottom: function (html, txt) {
        return html && html.replace('</head>', txt + '</head>');
    },
    // 将txt添加到html<body>底部
    appendToBodyBottom: function (html, txt) {
        return html && html.replace('</body>', txt + '</body>');
    }
};

/**
 * @author zhangpeng
 * @date 15/10/2-下午7:35
 * @file 在res.locals中添加layout相关函数, 并在res.render中渲染layout
 */

// node_modules
var _ = require('underscore');

var MARK = {
    DEFINE_LEFT: '<!--define--block--',
    START_LEFT: '<!--start--block--',
    END_LEFT: '<!--end--block--',
    RIGHT: '-->',

    define: function (blockName) {
        return this.DEFINE_LEFT + blockName + this.RIGHT;
    },

    start: function (blockName) {
        return this.START_LEFT + blockName + this.RIGHT;
    },

    end: function (blockName) {
        return this.END_LEFT + blockName + this.RIGHT;
    },

    /**
     * 返回html中标记的块名称列表
     * @param html 要检测的html文本
     * @returns {Array} 块名称列表
     */
    matchBlocks: function (html) {
        var self = this;
        var matchedList = html.match(new RegExp(self.DEFINE_LEFT + '.+' + self.RIGHT, 'g'));
        matchedList = _.map(matchedList, function (matched) {
            return matched.substring(self.DEFINE_LEFT.length, matched.length - self.RIGHT.length);
        });
        return matchedList;
    }
};

function LayoutLoader(resLocals, defaultModule, Resource) {
    if (!(this instanceof LayoutLoader)) return new LayoutLoader(resLocals, defaultModule, Resource);

    var self = this;
    self.logger = Resource.LoggerCreate(__filename);
    var Layout = Resource.Layout;
    self.layoutList = [];
    self.blockList = [];

    var renderLayout = function (layoutName, data, moduleName) {
        self.logger.trace('rendering, module:%s, layout:%s ', moduleName, layoutName);
        var layout = new Layout(moduleName, layoutName);
        self.layoutList.push(layout);
        data = {data: data || {}};    // 封装data
        data = _.isEmpty(data) ? resLocals : _.defaults(data, resLocals);
        return layout.loadTemplate(data);
    };

    _.extend(resLocals, {
        current_module: defaultModule,
        /**
         * 定义block区块
         * @param blockName 区块名称
         * @return {string} 区块标记（输出到html）
         */
        define_block: function (blockName) {
            if (self.blockList.indexOf(blockName) > -1) {
                throw new Error('block<' + blockName + '> is already defined!');
            }
            self.blockList.push(blockName);
            return MARK.define(blockName);
        },
        /**
         * 标记block区块开始
         * @param blockName 区块名称
         * @return {string} 区块开始标记
         */
        block_start: function (blockName) {
            return MARK.start(blockName);
        },
        /**
         * 标记block区块结束
         * @param blockName 区块名称
         * @return {string} 区块结束标记
         */
        block_end: function (blockName) {
            return MARK.end(blockName);
        },
        /**
         * 在模板中使用layout
         * @param layoutName layout的名称
         * @param data 渲染用的数据
         * @param moduleName layout所属模块，默认值是加载该layout的模板所属模块
         * @return {string} layout渲染后的内容
         */
        layout: function (layoutName, data, moduleName) {
            if (layoutName === undefined) {
                return '';
            }

            if (moduleName === undefined && typeof data === 'string') {
                moduleName = data;
                data = undefined;
            }

            if (moduleName === undefined) {
                // 未指定模块时默认渲染当前模块下layout
                moduleName = resLocals.current_module;
                return renderLayout(layoutName, data, moduleName);
            } else {
                // 跨模块渲染, 在指定模块下完成layout渲染, 完成后切换回原模块
                var lastModule = resLocals.current_module;
                self.logger.trace('set current module from:%s to:%s', resLocals.current_module, moduleName);
                resLocals.current_module = moduleName;
                var html = renderLayout(layoutName, data, moduleName);
                self.logger.trace('set current module from:%s to:%s', resLocals.current_module, lastModule);
                resLocals.current_module = lastModule;
                return html;
            }
        }
    });
}

_.extend(LayoutLoader.prototype, {
    /**
     * 用block标记的内容填坑
     * @param html 需要处理的html
     */
    render: function (html) {
        var self = this;
        var blockList = MARK.matchBlocks(html);
        self.logger.trace('rendering', blockList);
        _.each(blockList, function (blockName) {
            var defineTag = MARK.define(blockName);
            var startTag = MARK.start(blockName);
            var endTag = MARK.end(blockName);
            var startPos = html.indexOf(startTag) + startTag.length;
            var endPos = html.indexOf(endTag);

            self.logger.trace(startPos, endPos);
            if (startPos >= startTag.length && endPos > startTag.length) {
                html = html.replace(defineTag, html.substring(startPos, endPos))
                    .replace(new RegExp(startTag + '(.|\n)*' + endTag, 'g'), '');
                // self.logger.trace('\n' + html);
            } else {
                html = html.replace(defineTag, '');
            }
        });
        return html;
    },
    /**
     * @return {Array} 需要加载的脚本路径的数组
     */
    scripts: function () {
        return _.map(this.layoutList, function (layout) {
            return layout.scriptPath();
        });
    },

    /**
     * @return {Array} 需要加载的样式路径的数组
     */
    styles: function () {
        return _.map(this.layoutList, function (layout) {
            return layout.stylePath();
        });
    }
});

module.exports = LayoutLoader;

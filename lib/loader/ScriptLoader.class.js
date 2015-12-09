/**
 * @author zhangpeng
 * @date 15/10/2-下午7:40
 * @file ScriptLoader在res.locals中添加内嵌script写法的函数, 并在res.render中渲染
 */

// node_modules
var _ = require('underscore');

// system modules
var fs = require('fs');

var MARK = {
    // 内嵌script开始和结束标记，用于把标记内的脚本替换到body底部
    scriptStartMark: '<!--SCRIPT_START--><!--',
    scriptEndMark: '--><!--SCRIPT_END-->',
    scriptReg: /<!--SCRIPT_START--><!--[\w\W]*--><!--SCRIPT_END-->/gm,
    scriptInverseReg: /--><!--SCRIPT_END-->[\w\W]*<!--SCRIPT_START--><!--/gm,
    scriptRegNew: /<!--SCRIPT_START--><!--([\w\W]*?)--><!--SCRIPT_END-->/g
};

// 输出所有widget相关的脚本
function ScriptLoader(resLocals, Resource) {
    if (!(this instanceof ScriptLoader)) return new ScriptLoader(resLocals);

    var self = this;
    self.logger = Resource.LoggerCreate(__filename);
    self.PathTool = Resource.PathTool;
    self.scriptList = [];

    // 标记内嵌脚本的开始和结束，便于在render中替换到body结束位置
    _.extend(resLocals, {
        script_start: function () {
            return MARK.scriptStartMark;
        },
        script_end: function () {
            return MARK.scriptEndMark;
        },
        // path to the static dir or id
        load_script: function (path) {
            var foundPath = self.PathTool.findLibScript(path);
            if (foundPath) {
                self.scriptList.push(foundPath);
            } else {
                self.logger.warn('script:%s not found!', path);
            }
        }
    });
}

_.extend(ScriptLoader.prototype, {
    outputScripts: function (scriptPaths, merge) {
        var self = this;

        // 处理load_script加载的lib script
        var libOutput = '';
        _.chain(self.scriptList).unique().each(function (scriptPath) {
            self.logger.trace('scriptPath: ' + scriptPath);
            if (scriptPath) {
                libOutput += '<script type="text/javascript" src="' + scriptPath + '"></script>';
            }
        });
        self.logger.trace('libOutput: ' + libOutput);

        // 处理各widget, layout, page的同名script
        var output = '';
        _.chain(scriptPaths).unique().each(function (scriptPath) {
            self.logger.trace('scriptPath: ' + scriptPath);
            if (scriptPath) {
                if (merge) {
                    output += (fs.readFileSync(scriptPath) + '\n');
                } else {
                    output += '<script type="text/javascript" src="' + scriptPath + '"></script>';
                }
            }
        });
        if (merge && output) {
            output = '<script type="text/javascript">' + output + '</script>';
        }

        // self.logger.trace('scripts: ' + output);
        return libOutput + output;
    },

    outputNestedScripts: function (html) {
        var self = this;
        var output = '';
        var time = new Date().getTime();
        html = html.replace(MARK.scriptRegNew, function (match, inner) {
            output += inner;
            return '';
        });
        // self.logger.trace('outputNestedScripts %s', output);
        return {
            html: html,
            script: output
        };
    },

    // @duplicated 新版效率提升10倍
    // 输出内嵌的脚本
    outputNestedScriptsOld: function (html) {
        var self = this;
        var reg = MARK.scriptReg;
        var inReg = MARK.scriptInverseReg;
        var output = '';
        var temp;

        if (temp = html.match(reg)) {
            output = temp[0];
            while (output && (temp = output.match(inReg))) {
                temp = temp[0];
                output = output.replace(temp, temp.match(reg) ? (temp.match(reg)[0]) : '');
            }
            output = output.replace(new RegExp(MARK.scriptStartMark, 'g'), '');
            output = output.replace(new RegExp(MARK.scriptEndMark, 'g'), '');
            // 合并<script>标签, 为避免把带src的script合并, 暂时注释掉
            // output = output.replace(/<\/script>\n*<script>/g, '');
        }
        // self.logger.trace('scripts: ' + output);
        return output;
    },

    // @duplicated
    removeAnnotation: function (html) {
        var self = this;
        var startPos = html.indexOf(MARK.scriptStartMark);
        var endPos = html.indexOf(MARK.scriptEndMark);
        var endLen = MARK.scriptEndMark.length;
        while (startPos > 0 && endPos > startPos) {
            self.logger.trace(startPos, endPos);
            html = html.replace(html.substring(startPos, endPos + endLen), '');
            startPos = html.indexOf(MARK.scriptStartMark);
            endPos = html.indexOf(MARK.scriptEndMark);
        }
        return html;
    },

    replaceWithMin: function (html, extList, whiteList) {
        whiteList = _.flatten(whiteList);
        var self = this;
        var reg = new RegExp('="\\s*?\\S*?bower_components\\S*?(' + extList.join('|') + ')\\s*?(?=")', 'g');
        html = html.replace(reg, function (match, ext) {
            var fileName = match.substr(match.lastIndexOf('/') + 1);
            var result;
            if (whiteList.indexOf(fileName) > -1) {
                return match;
            }

            result = match.substring(0, match.lastIndexOf('.')) + '.min.' + ext;
            self.logger.info(match, 'to: ', result);
            return result;
        });

        return html;
    },

    // @duplicated
    replaceWithMinOld: function (html, ext, whiteList) {
        var self = this;
        var reg = new RegExp('=\\S*bower_components\\S*' + ext, 'g');
        var matches = html.match(reg);
        self.logger.info({matches: matches}, 'matches');

        var fileName;
        var splits;
        _.each(matches, function (item) {
            splits = item.split('/');
            fileName = _.last(splits);
            if (whiteList.indexOf(fileName) > -1) {
                return;
            }

            splits[splits.length - 1] = fileName.replace('.' + ext, '.min.' + ext);
            self.logger.info('%s to %s', item, splits.join('/'));
            html = html.replace(item, splits.join('/'));
        });
        return html;
    }
});

module.exports = ScriptLoader;

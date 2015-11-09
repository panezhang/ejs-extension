/**
 * @author zhangpeng
 * @date 15/10/2-下午6:37
 * @file 用于读取文件并输出内容
 */

// node_modules
var _ = require('underscore');

// system modules
var fs = require('fs');
var path = require('path');

module.exports = function (LoggerCreate) {
    var logger = LoggerCreate(__filename);
    
    return {
        /**
         * 读取指定的文件，并返回文本，文件不存在则返回null
         * @param filePath 文件的路径，有可能不带md5戳，读取的时候需要匹配带戳的文件
         */
        load: function (filePath) {
            var file = this.matchFile(filePath);
            return file && fs.readFileSync(file).toString();
        },

        // 判断带戳的fileName是否和baseName、extName相匹配
        matchFileName: function (fileName, baseName, extName) {
            return fileName && fileName.indexOf(baseName) === 0 && path.extname(fileName) === extName;
        },

        // 寻找与filePath匹配的带戳的文件，若存在则返回路径，不存在在返回null
        matchFile: function (filePath) {
            var matched = fs.existsSync(filePath) ? filePath : null;

            if (matched === null) {
                var self = this;
                var extName = path.extname(filePath);
                var baseName = path.basename(filePath, extName);
                var dirName = path.dirname(filePath);
                if (fs.existsSync(dirName)) {
                    var fileList = fs.readdirSync(dirName);
                    var fileMatchedList = [];
                    _.each(fileList, function (fileName) {
                        if (self.matchFileName(fileName, baseName, extName)) {
                            fileMatchedList.push(path.join(dirName, fileName));
                        }
                    });
                    if (fileMatchedList.length > 1) {
                        // 匹配到多余1个文件, 则找最新的文件
                        matched = _.chain(fileMatchedList)
                            .map(function (fileMatched) {
                                return {
                                    path: fileMatched,
                                    time: fs.statSync(fileMatched).mtime.getTime()
                                };
                            })
                            .sort(function (file1, file2) {
                                return file2.time - file1.time;
                            })
                            .map(function (file) {
                                logger.trace(file);
                                return file.path;
                            })
                            .value()[0];
                    } else {
                        matched = fileMatchedList[0];
                    }
                }
            }
            logger.trace('Matched File:\nmatch %s,\nas    %s', filePath, matched);

            return matched;
        }
    }
};

/**
 * @author zhangpeng
 * @date 15/10/9-下午2:54
 * @file UserAgentHandler
 */

// node_modules

// system modules
var path = require('path');

// our modules

module.exports = function (LoggerCreate) {
    var logger = LoggerCreate(__filename);
    var AgentParser = require(path.join('..', 'tool', 'AgentParser'))(LoggerCreate);

    return function (req, res) {
        res.locals.AgentHelper = AgentParser.parseReq(req);
    }
};

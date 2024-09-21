"use strict";
var _a;
exports.__esModule = true;
exports.config = exports.file = void 0;
var fs = require("fs-extra");
var path = require("path");
var dotenv = require('dotenv');
var isProd = process.env.NODE_ENV === 'production';
function parseEnv() {
    var localenv = path.resolve(__dirname, '../../.env');
    var prodenv = path.resolve(__dirname, '../../.env.prod');
    if (!fs.existsSync(localenv) && !fs.existsSync(prodenv)) {
        throw new Error("Can not locate any .env file in " + __dirname);
    }
    var file = isProd && fs.existsSync(prodenv) ? prodenv : localenv;
    var config = dotenv.parse(fs.readFileSync(file));
    return { file: file, config: config };
}
exports.file = (_a = parseEnv(), _a.file), exports.config = _a.config;

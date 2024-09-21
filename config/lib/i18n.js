"use strict";
var _a;
exports.__esModule = true;
exports.defaultLocale = exports.locales = exports.messages = void 0;
var fs = require("fs-extra");
var path = require("path");
function parseI18n() {
    // 本地的国际化文案
    var localesDir = path.join(__dirname, '../../locales');
    if (!fs.existsSync(localesDir)) {
        return { messages: {}, locales: [], defaultLocale: '' };
    }
    var files = fs.readdirSync(localesDir);
    var messages = files.reduce(function (i18n, file) {
        var language = file.replace(path.extname(file), '');
        var json = fs.readJsonSync(path.join(localesDir, file));
        i18n[language] = json;
        return i18n;
    }, {});
    var locales = Object.keys(messages);
    var defaultLocale = 'zh' in messages ? 'zh' : locales[0];
    return { messages: messages, locales: locales, defaultLocale: defaultLocale };
}
exports.messages = (_a = parseI18n(), _a.messages), exports.locales = _a.locales, exports.defaultLocale = _a.defaultLocale;

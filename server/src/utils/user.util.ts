export function isValidUsername(username) {
  // 字符限制，只允许字母、数字、下划线
  var reg = /^[a-zA-Z0-9_]+$/;
  if (!reg.test(username)) {
    return false;
  }
  // 空格限制
  if (/\s/.test(username)) {
    return false;
  }
  // 敏感词限制，这里假设不允许包含 admin、root 等词汇
  if (username.indexOf('admin') >= 0 || username.indexOf('root') >= 0) {
    return false;
  }
  return true;
}

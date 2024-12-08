export function jsonp(url, params, callback) {
    // 创建一个唯一的回调函数名
    const callbackName = `jsonp_callback_${Date.now()}`;
   
    // 将回调函数名添加到参数中
    params.cb = callbackName;
   
    // 将参数转换为查询字符串
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
   
    // 创建 <script> 元素来加载 JSONP 响应
    const script = document.createElement('script');
    script.src = `${url}?${queryString}`;
   
    // 将回调函数添加到全局作用域中
    window[callbackName] = function(data) {
      // 调用用户提供的回调并传递数据
      callback(data);
   
      // 清理：从全局作用域中删除回调函数
      delete window[callbackName];
   
      // 移除 <script> 元素
      document.head.removeChild(script);
    };
   
    // 将 <script> 元素添加到 DOM 中以触发请求
    document.head.appendChild(script);
   
    // 可选的：添加一个错误处理机制
    // 注意：对于 JSONP，真正的错误处理是有限的，因为浏览器不会为 <script> 标签的加载失败提供详细的错误信息。
    script.onerror = function() {
      // 调用回调并传递错误（注意：这里的错误信息可能不是很详细）
      callback(new Error('JSONP request failed'));
   
      // 清理：从全局作用域中删除回调函数（如果还没有被调用的话）
      if (window[callbackName]) {
        delete window[callbackName];
      }
   
      // 移除 <script> 元素（如果还在 DOM 中的话）
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }
type JsonpCallback = (data: unknown) => void;

declare global {
  interface Window {
    [key: string]: JsonpCallback | unknown;
  }
}

export function jsonp(
  url: string,
  params: Record<string, string>,
  callback: JsonpCallback,
): void {
  const callbackName = `jsonp_callback_${Date.now()}`;
  const queryParams: Record<string, string> = { ...params, cb: callbackName };
  const queryString = Object.keys(queryParams)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');

  const script = document.createElement('script');
  script.src = `${url}?${queryString}`;

  window[callbackName] = (data: unknown) => {
    callback(data);
    delete window[callbackName];
    document.head.removeChild(script);
  };

  script.onerror = () => {
    callback(new Error('JSONP request failed'));
    if (window[callbackName]) {
      delete window[callbackName];
    }
    if (document.head.contains(script)) {
      document.head.removeChild(script);
    }
  };

  document.head.appendChild(script);
}

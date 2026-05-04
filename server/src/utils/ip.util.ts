// eslint-disable-next-line @typescript-eslint/no-var-requires
const ipSearcher = require('node-ip2region').create();

export function getClientIP(req) {
  const ip =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
    (req.connection && req.connection.remoteAddress) || // 判断 connection 的远程 IP
    (req.socket && req.socket.remoteAddress) || // 判断后端的 socket 的 IP
    (req.connection && req.connection.socket && req.connection.socket.remoteAddress);

  return ip ? ip.split(':').pop() : '';
}

export function parseIp(ip) {
  try {
    const { region } = ipSearcher.btreeSearchSync(ip);
    return region
      .split('|')
      .filter((d) => +d !== 0)
      .join(' ');
  } catch (e) {
    return '';
  }
}

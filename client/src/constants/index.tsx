// 标签颜色
export const TAG_COLORS = [
  'magenta',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  '#2db7f5',
  '#87d068',
  '#108ee9',
  '#52c41a',
  '#f5222d',
  '#1890ff',
  '#faad14',
  '#ff0064',
  '#722ed1',
];

export const getRandomColor = (() => {
  const cache = {};

  return (key): string => {
    if (!cache[key]) {
      const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      cache[key] = color;
      return color;
    }
    return cache[key];
  };
})();

/** Tag palette — matches client `getColorFromNumber`. */
const TAG_COLORS = [
  '#52c41a',
  '#f5222d',
  '#1890ff',
  '#faad14',
  '#ff0064',
  '#722ed1',
  '#dc3545',
  '#17a2b8',
  '#00b74a',
  '#fc651f',
  '#6c757d',
  '#f5c800',
  '#808695',
  '#2db7f5',
  '#87d068',
  '#108ee9',
] as const;

export function getColorFromNumber(index: number): string {
  return TAG_COLORS[index % TAG_COLORS.length];
}

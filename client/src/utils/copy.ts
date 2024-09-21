import { message } from 'antd';
import _copy from 'copy-to-clipboard';

export function copy(text, t) {
  if (t) {
    message.success(t('copySuccess'));
  } else {
    message.success('复制成功');
  }
  return _copy(text);
}

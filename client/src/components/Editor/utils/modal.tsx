import { Modal } from 'antd';

export const confirm = () => {
  return new Promise((resolve, reject) => {
    return Modal.confirm({
      title: '内容恢复',
      content: '系统检测到上一次内容缓存，是否恢复该内容？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        resolve(null);
      },
      onCancel: () => {
        reject(new Error('canceld'));
      },
      transitionName: '',
      maskTransitionName: '',
    });
  });
};

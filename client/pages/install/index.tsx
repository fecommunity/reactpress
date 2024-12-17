import React, { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
 
const InstallPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
 
    try {
      // 发送POST请求到你的后端API进行数据库配置验证和初始化
    //   const response = await axios.post('/api/install', values);
 
    //   if (response.data.success) {
    //     // 安装成功，重定向到登录页面或其他页面
    //     router.push('/login');
    //   } else {
    //     // 处理错误
    //     setError(response.data.message);
    //   }
    } catch (err) {
      setError('安装过程中发生错误，请重试。');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="install-container">
      <h1>安装向导</h1>
      {error && <div className="error-message">{error}</div>}
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="site_title"
          label="站点标题"
          rules={[{ required: true, message: '请输入站点标题！' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入站点标题" />
        </Form.Item>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码！' }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
        </Form.Item>
        <Form.Item
          name="email"
          label="电子邮箱"
          rules={[
            { type: 'email', message: '请输入有效的电子邮箱！' },
            { required: true, message: '请输入电子邮箱！' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="请输入电子邮箱" />
        </Form.Item>
        <Form.Item>
          <Form.Item name="agree" valuePropName="checked" noStyle>
            <Checkbox>我同意以上条款和条件</Checkbox>
          </Form.Item>
          <div className="form-item-error" style={{ color: 'red' }}>
            {form.getFieldError('agree')?.message}
          </div>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            安装
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
 
export default InstallPage;
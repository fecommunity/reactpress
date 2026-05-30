import { Form } from '@ant-design/compatible';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { Button, Col, Input, Row } from 'antd';
import React from 'react';

import style from './index.module.scss';

export interface IFieldItem {
  label: React.ReactNode;
  field: string;
  rules?: Array<unknown>;
  msg?: string;
  children?: React.ReactNode;
}

interface IProps extends FormComponentProps {
  fields: Array<IFieldItem>;
  showLabel?: boolean;
  padding?: number | string;
  onSearch?: (arg) => void;
  onReset?: (arg) => void;
}

const _Search: React.FC<IProps> = ({ form, fields = [], showLabel = true, padding = 12, onSearch }) => {
  const getFields = () => {
    const { getFieldDecorator } = form;
    const children = [];
    for (const field of fields) {
      children.push(
        <Col xs={24} sm={12} md={6} key={field.field}>
          <Form.Item
            {...(showLabel
              ? {
                  label: field.label,
                  labelCol: {
                    xs: { span: 24 },
                    sm: { span: 12 },
                    md: { span: 6 },
                  },
                }
              : {})}
          >
            {getFieldDecorator(field.field, {
              rules: field.rules,
            })(field.children ? field.children : <Input width={'100%'} placeholder={field.msg || 'placeholder'} />)}
          </Form.Item>
        </Col>
      );
    }
    return children;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    form.validateFields((_, values) => {
      onSearch(values);
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const submitContent = (
    <Form.Item>
      <Button type="primary" htmlType="submit">
        搜索
      </Button>
      <Button style={{ marginLeft: 8 }} onClick={handleReset}>
        重置
      </Button>
    </Form.Item>
  );

  return (
    <Form className={style.wrapper} style={{ padding }} layout="inline" onSubmit={handleSearch}>
      <Row gutter={24}>{getFields()}</Row>
      <Row gutter={24}>
        <Col span={24} style={{ textAlign: 'right' }}>
          {submitContent}
        </Col>
      </Row>
    </Form>
  );
};

export const Search = Form.create<IProps>({ name: 'advanced_search' })(_Search);

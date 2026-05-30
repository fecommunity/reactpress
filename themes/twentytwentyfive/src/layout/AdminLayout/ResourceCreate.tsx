import { PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import Link from 'next/link';
import { default as Router } from 'next/router';
import React from 'react';
import style from './index.module.scss';

export const ResourceCreate = ({ collapsed = false }) => {
  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          window.location.pathname = '/admin/article/editor';
        }}
      >
        <Link href={'/admin/article/editor'}>
          <a>
            <span>新建文章</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          window.location.pathname = 'admin/knowledge';
        }}
      >
        <Link href={'admin/knowledge'}>
          <a>
            <span>新建专辑</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          window.location.pathname = '/admin/page/editor';
        }}
      >
        <Link href={'/admin/page/editor'}>
          <a>
            <span>新建页面</span>
          </a>
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomLeft">
      <Button className={style.button} type="primary" size="large" icon={<PlusOutlined />}>
        {!collapsed && '新建'}
      </Button>
    </Dropdown>
  );
};

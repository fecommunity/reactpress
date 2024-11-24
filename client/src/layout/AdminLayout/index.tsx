import { Icon as LegacyIcon } from '@ant-design/compatible';
import { GithubOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Layout, Menu, Row } from 'antd';
import cls from 'classnames';
import Link from 'next/link';
import { default as Router, useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';

import { UserInfo } from '@/components/UserInfo';
import { GlobalContext } from '@/context/global';

import style from './index.module.scss';
import { findActiveKeys, findActiveMenu, menus } from './menus';
import { ResourceCreate } from './ResourceCreate';

const { Sider, Content, Footer } = Layout;
const { SubMenu } = Menu;

export const AdminLayout: React.FC<{ headerAppender?: React.ReactNode }> = ({ headerAppender, children }) => {
  const { collapsed, toggleCollapse } = useContext(GlobalContext);
  const router = useRouter();
  const { pathname } = router;
  const [activeMenu, breadcrumbs] = findActiveMenu(pathname);
  const pathOpenedKeys = findActiveKeys(pathname);
  const context = useContext(GlobalContext);

  const onOpenChange = (keys) => {
    const activeKey = keys[keys.length - 1];
    const menu = menus.find((item) => item.title === activeKey);
    const path = menu?.path || menu?.children?.[0]?.path;
    
    if (!path || path === activeKey) {
      return;
    }
    router.push(path);
  };

  useEffect(() => {
    document.body.classList.remove('dark');
    context.changeTheme('light');
  }, [])

  const renderMenuItem = (menu) => (
    <Menu.Item
      className={style.menu}
      key={`${menu.path}`}
      onClick={() => {
        Router.push(menu.path);
      }}
    >
      <Link href={`${menu.path}`}>
        <a
          className={cls({
            [style.active]: activeMenu && activeMenu.path === menu.path,
          })}
        >
          {menu.icon}
          <span>{menu.title}</span>
        </a>
      </Link>
    </Menu.Item>
  );

  const MenuContent = (
    <Menu
      theme={'dark'}
      onOpenChange={onOpenChange}
      openKeys={pathOpenedKeys}
      mode="inline"
      defaultSelectedKeys={[activeMenu && activeMenu.path]}
    >
      {menus
        .filter((m) => !m.ignore)
        .map((menu) => {
          return menu.children ? (
            <SubMenu key={menu.title} icon={menu.icon} title={menu.title}>
              {menu.children.filter((m) => !m.ignore).map(renderMenuItem)}
            </SubMenu>
          ) : (
            renderMenuItem(menu)
          );
        })}
    </Menu>
  );

  return (
    <Layout className={style.container}>
      <Sider className={style.asider} trigger={null} collapsible={true} collapsed={collapsed}>
        <div className={style.logo}>
          {!collapsed && <span style={{ marginLeft: 4 }}>ReactPress管理后台</span>}
        </div>
        <div className={style.resourceCreate}>
          <ResourceCreate collapsed={collapsed} />
        </div>
        {MenuContent}
      </Sider>
      <Layout className={style.main}>
        <header>
          <Row>
            <Col span={12}>
              <LegacyIcon className="trigger" type={collapsed ? 'menu-unfold' : 'menu-fold'} onClick={toggleCollapse} />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <div className={style.info}>
                <a className={style.github} href="/" rel="noreferrer">
                  <HomeOutlined />
                </a>
                <a
                  className={style.github}
                  href="https://github.com/fecommunity/reactpress"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubOutlined />
                </a>
                <UserInfo />
              </div>
            </Col>
          </Row>
        </header>
        <Content className={style.content}>
          <header>
            <Breadcrumb>
              {breadcrumbs.map((breadcrumb) => {
                return (
                  <Breadcrumb.Item key={breadcrumb.path}>
                    <Link href={breadcrumb.path}>
                      <a>{breadcrumb.title}</a>
                    </Link>
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
            <div className={style.title}>{activeMenu && activeMenu.label}</div>
            {headerAppender && <div>{headerAppender}</div>}
          </header>
          <main>{children}</main>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ReactPress ©{new Date().getFullYear()} Created by{' '}
          <a className={style.github} href="https://github.com/fecommunity/reactpress" target="_blank" rel="noreferrer">
            FECommunity
          </a>
        </Footer>
      </Layout>
    </Layout>
  );
};

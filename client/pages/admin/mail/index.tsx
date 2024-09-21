import { Alert, Button, message, Modal, Popconfirm } from 'antd';
import { NextPage } from 'next';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';

import { LocaleTime } from '@/components/LocaleTime';
import { PaginationTable } from '@/components/PaginationTable';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { usePagination } from '@/hooks/usePagination';
import { useSetting } from '@/hooks/useSetting';
import { AdminLayout } from '@/layout/AdminLayout';
import { MailProvider } from '@/providers/mail';

import style from './index.module.scss';

const SCROLL = { x: 1440 };
const SEARCH_FIELDS = [
  {
    label: '发件人',
    field: 'from',
    msg: '请输入发件人',
  },
  {
    label: '收件人',
    field: 'to',
    msg: '请输入收件人',
  },
  {
    label: '主题',
    field: 'subject',
    msg: '请输入主题',
  },
];
const COMMON_COLUMNS = [
  {
    title: '发件人',
    dataIndex: 'from',
    key: 'from',
  },
  {
    title: '收件人',
    dataIndex: 'to',
    key: 'to',
  },
  {
    title: '主题',
    dataIndex: 'subject',
    key: 'subject',
  },
];
const TIME_COLUMN = {
  title: '发送时间',
  dataIndex: 'createAt',
  key: 'createAt',
  render: (date) => <LocaleTime date={date} />,
};

const Mail: NextPage = () => {
  const setting = useSetting();
  const { loading, data: mails, refresh, ...resetPagination } = usePagination<IMail>(MailProvider.getMails);
  const [deleteApi, deleteLoading] = useAsyncLoading(MailProvider.deleteMail);
  const [selectedMail, setSelectedMail] = useState(null);
  const isSmtpSettingFullfilled = useMemo(() => {
    return (
      setting &&
      setting.smtpHost &&
      setting.smtpPort &&
      setting.smtpUser &&
      setting.smtpFromUser &&
      setting.smtpFromUser
    );
  }, [setting]);

  const deleteAction = useCallback(
    (ids, resetSelectedRows = null) => {
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      return () => {
        Promise.all(ids.map((id) => deleteApi(id))).then(() => {
          message.success('操作成功');
          resetSelectedRows && resetSelectedRows();
          refresh();
        });
      };
    },
    [deleteApi, refresh]
  );

  const contentColumn = [
    {
      title: '内容',
      dataIndex: 'html',
      key: 'html',
      render: (_, record) => (
        <Button
          type="link"
          style={{ paddingLeft: 0 }}
          onClick={() => {
            setSelectedMail(record);
          }}
        >
          点击查看
        </Button>
      ),
    },
  ];

  const actionColumn = (resetSelectedRows) => ({
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <span className={style.action}>
        <Popconfirm
          title="确认删除这个邮件？"
          onConfirm={deleteAction(record.id, resetSelectedRows)}
          okText="确认"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>
      </span>
    ),
  });

  return (
    <AdminLayout>
      <div className={style.wrapper}>
        {!isSmtpSettingFullfilled ? (
          <div style={{ marginBottom: 24 }}>
            <Alert
              message={
                <span>
                  系统检测到<strong>SMTP 配置</strong>未完善，当收到评论时，无法进行邮件通知。
                  <Link href="/admin/setting?type=SMTP服务">
                    <a>点我立即完善</a>
                  </Link>
                </span>
              }
              type="warning"
            />
          </div>
        ) : null}
        <PaginationTable
          showSelection={true}
          loading={loading}
          data={mails}
          columns={(resetSelectedRows) => [
            ...COMMON_COLUMNS,
            contentColumn,
            TIME_COLUMN,
            actionColumn(resetSelectedRows),
          ]}
          refresh={refresh}
          {...resetPagination}
          renderLeftNode={({ hasSelected, selectedRowKeys, resetSelectedRows }) =>
            hasSelected ? (
              <Popconfirm
                title="确认删除？"
                onConfirm={deleteAction(selectedRowKeys, resetSelectedRows)}
                okText="确认"
                cancelText="取消"
              >
                <Button disabled={!hasSelected} loading={deleteLoading} danger={true}>
                  删除
                </Button>
              </Popconfirm>
            ) : null
          }
          scroll={SCROLL}
          searchFields={SEARCH_FIELDS}
        />
        <Modal
          title={'发送内容'}
          visible={selectedMail}
          footer={null}
          width={786 + 48}
          onCancel={() => {
            setSelectedMail(null);
          }}
          transitionName={''}
          maskTransitionName={''}
        >
          <div
            className="markdown"
            style={{ overflow: 'auto !important' }}
            dangerouslySetInnerHTML={{
              __html: selectedMail && selectedMail.html,
            }}
          ></div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Mail;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Form, Table, theme } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/api/schemas";
import { articleListThemeVars } from "@/modules/article/components/articleListThemeVars";
import styles from "@/modules/comment/components/comment-list.module.css";
import userStyles from "@/modules/user/components/user-list.module.css";
import { UserListSubHeader } from "@/modules/user/components/UserListSubHeader";
import { UserListTablenav, type UserBulkAction } from "@/modules/user/components/UserListTablenav";
import {
  bulkChangeUserRole,
  bulkChangeUserStatus,
  createUser,
  deleteUser,
  fetchUserRoleCounts,
  fetchUsers,
  updateUser,
  type UserListRow,
  type UserListSearch,
} from "@/modules/user/userListApi";
import { FormModal, type UserFormValues } from "@/routes/_auth/users/-FormModal";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { AUTH_MODE } from "@/utils/constants";

export type { UserListSearch };

function roleLabel(role: string, t: (key: string) => string): string {
  if (role === "admin") return t("users.roleAdmin");
  if (role === "visitor") return t("users.roleSubscriber");
  if (role === "editor") return t("users.roleEditor");
  return role;
}

interface UserListPageProps {
  search: UserListSearch;
  routePath: string;
}

export function UserListPage({ search, routePath }: UserListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const listThemeStyle = useMemo(() => articleListThemeVars(token), [token]);
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState(search.keyword);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<UserBulkAction | undefined>();
  const [roleChange, setRoleChange] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  useEffect(() => {
    setKeywordInput(search.keyword);
  }, [search.keyword]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", search],
    queryFn: () => fetchUsers(search),
    staleTime: 30_000,
  });

  const { data: roleCounts } = useQuery({
    queryKey: ["user-role-counts"],
    queryFn: fetchUserRoleCounts,
    staleTime: 30_000,
  });

  const invalidateUsers = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["users"] });
    void queryClient.invalidateQueries({ queryKey: ["user-role-counts"] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      invalidateUsers();
      message.success(t("common.createdSuccess"));
      setModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error(t("common.createFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      invalidateUsers();
      message.success(t("common.updatedSuccess"));
      setModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => message.error(t("common.updateFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      invalidateUsers();
      message.success(t("common.deletedSuccess"));
    },
    onError: () => message.error(t("common.deleteFailed")),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteUser(id)));
    },
    onSuccess: () => {
      invalidateUsers();
      setSelectedRowKeys([]);
      setBulkAction(undefined);
      message.success(t("users.bulkSuccess"));
    },
    onError: () => message.error(t("common.deleteFailed")),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: "active" | "locked" }) =>
      bulkChangeUserStatus(ids, status),
    onSuccess: () => {
      invalidateUsers();
      setSelectedRowKeys([]);
      setBulkAction(undefined);
      message.success(t("users.statusUpdated"));
    },
    onError: () => message.error(t("common.updateFailed")),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "locked" }) =>
      updateUser({ id, status }),
    onSuccess: () => {
      invalidateUsers();
      message.success(t("users.statusUpdated"));
    },
    onError: () => message.error(t("common.updateFailed")),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ ids, role }: { ids: string[]; role: string }) => bulkChangeUserRole(ids, role),
    onSuccess: () => {
      invalidateUsers();
      setSelectedRowKeys([]);
      setRoleChange(undefined);
      message.success(t("users.roleChangeSuccess"));
    },
    onError: () => message.error(t("common.updateFailed")),
  });

  const applySearch = useCallback(
    (patch: Partial<UserListSearch>) => {
      void navigate({
        search: (prev: UserListSearch) => ({ ...prev, page: 1, ...patch }),
      });
    },
    [navigate],
  );

  const runSearch = () => applySearch({ keyword: keywordInput.trim() });

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: UserListRow) => {
    const user: User = {
      id: record.id,
      username: record.username,
      avatar: record.avatar,
      email: record.email,
      roles: record.roles,
      permissions: [],
    };
    setEditingUser(user);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.roles[0] ?? record.role,
    });
    setModalOpen(true);
  };

  const confirmDelete = useCallback(
    (record: UserListRow) => {
      if (AUTH_MODE === "server") {
        message.warning(t("users.deleteNotSupported"));
        return;
      }
      modal.confirm({
        title: t("users.deleteTitle"),
        content: t("users.deleteContent"),
        okText: t("common.delete"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => deleteMutation.mutateAsync(record.id),
      });
    },
    [deleteMutation, message, modal, t],
  );

  const runBulkApply = () => {
    if (!bulkAction) return;
    if (selectedRowKeys.length === 0) {
      message.warning(t("users.selectUsersFirst"));
      return;
    }
    if (bulkAction === "disable") {
      modal.confirm({
        title: t("users.disableTitle"),
        content: t("users.bulkDisableConfirm", { count: selectedRowKeys.length }),
        okText: t("users.disable"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => bulkStatusMutation.mutateAsync({ ids: selectedRowKeys, status: "locked" }),
      });
      return;
    }
    if (bulkAction === "enable") {
      bulkStatusMutation.mutate({ ids: selectedRowKeys, status: "active" });
      return;
    }
    if (bulkAction === "delete") {
      if (AUTH_MODE === "server") {
        message.warning(t("users.deleteNotSupported"));
        return;
      }
      modal.confirm({
        title: t("users.deleteTitle"),
        content: t("users.bulkDeleteConfirm", { count: selectedRowKeys.length }),
        okText: t("common.delete"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => bulkDeleteMutation.mutateAsync(selectedRowKeys),
      });
    }
  };

  const runRoleChangeApply = () => {
    if (!roleChange) return;
    if (selectedRowKeys.length === 0) {
      message.warning(t("users.selectUsersFirst"));
      return;
    }
    roleChangeMutation.mutate({ ids: selectedRowKeys, role: roleChange });
  };

  const toggleUserStatus = useCallback(
    (record: UserListRow) => {
      const nextStatus = record.status === "locked" ? "active" : "locked";
      if (nextStatus === "locked") {
        modal.confirm({
          title: t("users.disableTitle"),
          content: t("users.disableContent", { name: record.username }),
          okText: t("users.disable"),
          okType: "danger",
          cancelText: t("common.cancel"),
          onOk: () => statusMutation.mutateAsync({ id: record.id, status: "locked" }),
        });
        return;
      }
      statusMutation.mutate({ id: record.id, status: "active" });
    },
    [modal, statusMutation, t],
  );

  const columns = useMemo(
    () => [
      {
        title: t("common.username"),
        dataIndex: "username",
        key: "username",
        className: userStyles.colUsername,
        sorter: true,
        sortOrder: search.sortField === "username" ? search.sortOrder : null,
        render: (_: unknown, record: UserListRow) => {
          const src = (record.avatar ?? "").trim() || undefined;
          return (
            <div className={userStyles.userCell}>
              <Avatar size={32} src={src} className={userStyles.userAvatar}>
                {record.username?.[0]?.toUpperCase()}
              </Avatar>
              <div className={userStyles.userMeta}>
                <div className={userStyles.userNameRow}>
                  <button
                    type="button"
                    className={styles.filterLink}
                    onClick={() => openEditModal(record)}
                  >
                    <span className={userStyles.userName}>{record.username}</span>
                  </button>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className={styles.rowAction}
                    onClick={() => openEditModal(record)}
                  >
                    {t("common.edit")}
                  </button>
                  <span className={styles.rowActionSep}>|</span>
                  <button
                    type="button"
                    className={styles.rowAction}
                    onClick={() => toggleUserStatus(record)}
                  >
                    {record.status === "locked" ? t("users.enable") : t("users.disable")}
                  </button>
                  {AUTH_MODE !== "server" ? (
                    <>
                      <span className={styles.rowActionSep}>|</span>
                      <button
                        type="button"
                        className={`${styles.rowAction} ${styles.rowActionDanger}`}
                        onClick={() => confirmDelete(record)}
                      >
                        {t("common.delete")}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: t("users.displayName"),
        dataIndex: "displayName",
        key: "displayName",
        render: (value: string | null) => value ?? "—",
      },
      {
        title: t("common.email"),
        dataIndex: "email",
        key: "email",
        sorter: true,
        sortOrder: search.sortField === "email" ? search.sortOrder : null,
        render: (email: string | null) =>
          email ? (
            <a className={styles.filterLink} href={`mailto:${email}`}>
              {email}
            </a>
          ) : (
            "—"
          ),
      },
      {
        title: t("common.roles"),
        dataIndex: "role",
        key: "role",
        render: (role: string) => roleLabel(role, t),
      },
      {
        title: t("users.status"),
        dataIndex: "status",
        key: "status",
        width: 88,
        render: (status: UserListRow["status"]) =>
          status === "locked" ? t("users.statusLocked") : t("users.statusActive"),
      },
    ],
    [confirmDelete, search.sortField, search.sortOrder, t, toggleUserStatus],
  );

  const total = data?.total ?? 0;

  const tablenavProps = {
    bulkAction,
    onBulkActionChange: setBulkAction,
    onBulkApply: runBulkApply,
    bulkApplying: bulkDeleteMutation.isPending || bulkStatusMutation.isPending,
    showDeleteBulk: AUTH_MODE !== "server",
    roleChange,
    onRoleChangeSelect: setRoleChange,
    onRoleChangeApply: runRoleChangeApply,
    roleChangeApplying: roleChangeMutation.isPending,
    total,
    page: search.page,
    pageSize: search.pageSize,
    onPageChange: (page: number) => {
      void navigate({ search: (prev: UserListSearch) => ({ ...prev, page }) });
    },
  };

  if (isError) {
    return <ModulePlaceholder title={t("menu.users")} description={t("users.loadError")} />;
  }

  return (
    <div className={styles.wrap} style={listThemeStyle}>
      <UserListSubHeader
        role={search.role}
        counts={roleCounts}
        onRoleChange={(role) => applySearch({ role })}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={runSearch}
        onCreateClick={openCreateModal}
      />
      <UserListTablenav position="top" {...tablenavProps} />
      <div className={styles.tableCard}>
        <Table<UserListRow>
          rowKey="id"
          size="small"
          loading={isLoading}
          dataSource={data?.list ?? []}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys.map(String)),
          }}
          rowClassName={(record) => (record.status === "locked" ? "rowLocked" : "")}
          columns={columns}
          onChange={(_pagination, _filters, sorter) => {
            if (Array.isArray(sorter)) return;
            void navigate({
              search: (prev: UserListSearch) => ({
                ...prev,
                sortField: sorter.order ? String(sorter.field) : null,
                sortOrder: sorter.order ?? null,
              }),
            });
          }}
        />
      </div>
      <UserListTablenav position="bottom" compact {...tablenavProps} />

      <FormModal
        open={modalOpen}
        editingUser={editingUser}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onFinish={(values) => {
          const roles = [values.role];
          if (editingUser) {
            updateMutation.mutate({
              id: editingUser.id,
              username: values.username,
              email: values.email,
              roles,
            });
          } else {
            createMutation.mutate({
              username: values.username,
              email: values.email,
              roles,
              password: values.password,
            });
          }
        }}
      />
    </div>
  );
}

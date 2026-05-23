import type { CreateUserRequest } from "@/api/schemas";
import { USER_ENDPOINTS } from "@/api/user";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";
import { AUTH_MODE } from "@/utils/constants";
import { httpClient } from "@/utils/http";

export type UserListSearch = {
  page: number;
  pageSize: number;
  keyword: string;
  role: string;
  sortField: string | null;
  sortOrder: "ascend" | "descend" | null;
};

export type UserListRow = {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  email: string | null;
  role: string;
  roles: string[];
  status: "active" | "locked";
};

export type UserRoleCounts = {
  all: number;
  admin: number;
  visitor: number;
};

function mapListUser(raw: Record<string, unknown>): UserListRow {
  const role = String(
    raw.role ?? (Array.isArray(raw.roles) ? raw.roles[0] : undefined) ?? "visitor",
  );
  const status = raw.status === "locked" ? "locked" : "active";
  return {
    id: String(raw.id),
    username: String(raw.name ?? raw.username ?? ""),
    displayName: typeof raw.displayName === "string" ? raw.displayName : null,
    avatar: (raw.avatar as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    role,
    roles: Array.isArray(raw.roles) ? (raw.roles as string[]) : [role],
    status,
  };
}

function buildListQuery(search: UserListSearch): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.role) query.role = search.role;
  if (search.keyword.trim()) query.name = search.keyword.trim();
  return query;
}

function sortRows(list: UserListRow[], search: UserListSearch): UserListRow[] {
  const field = search.sortField;
  if (!field || !search.sortOrder) return list;
  const dir = search.sortOrder === "ascend" ? 1 : -1;
  return [...list].sort((a, b) => {
    const av = String((a as Record<string, unknown>)[field] ?? "");
    const bv = String((b as Record<string, unknown>)[field] ?? "");
    return av.localeCompare(bv, undefined, { sensitivity: "base" }) * dir;
  });
}

export async function fetchUsers(search: UserListSearch) {
  const api = await getToolkitClient();
  const res = await api.user.findAll({
    query: buildListQuery(search),
  } as Parameters<typeof api.user.findAll>[0]);
  const parsed = parsePaginated<Record<string, unknown>>(res);
  return {
    list: sortRows(parsed.list.map(mapListUser), search),
    total: parsed.total,
  };
}

export async function fetchUserRoleCounts(): Promise<UserRoleCounts> {
  const api = await getToolkitClient();
  const baseQuery = { page: 1, pageSize: 1 };
  const [allRes, adminRes, visitorRes] = await Promise.all([
    api.user.findAll({ query: baseQuery } as Parameters<typeof api.user.findAll>[0]),
    api.user.findAll({
      query: { ...baseQuery, role: "admin" },
    } as Parameters<typeof api.user.findAll>[0]),
    api.user.findAll({
      query: { ...baseQuery, role: "visitor" },
    } as Parameters<typeof api.user.findAll>[0]),
  ]);
  return {
    all: parsePaginated(allRes).total,
    admin: parsePaginated(adminRes).total,
    visitor: parsePaginated(visitorRes).total,
  };
}

export async function createUser(values: CreateUserRequest & { password?: string }) {
  const role = values.roles[0] ?? "visitor";
  if (AUTH_MODE === "server") {
    const api = await getToolkitClient();
    const res = (await api.user.register({
      body: {
        name: values.username,
        password: values.password ?? values.username,
        email: values.email,
        role,
      },
    } as Parameters<typeof api.user.register>[0])) as unknown as Record<string, unknown>;
    return mapListUser(res);
  }
  const res = (await httpClient.post(USER_ENDPOINTS.create, values)) as Record<string, unknown>;
  return mapListUser(res);
}

export async function updateUser(values: {
  id: string;
  username?: string;
  email?: string | null;
  roles?: string[];
  status?: "active" | "locked";
}) {
  const role = values.roles?.[0];
  if (AUTH_MODE === "server") {
    const api = await getToolkitClient();
    const res = (await api.user.update({
      body: {
        id: values.id,
        name: values.username,
        email: values.email,
        role,
        status: values.status,
      },
    } as Parameters<typeof api.user.update>[0])) as unknown as Record<string, unknown>;
    return mapListUser(res);
  }
  const res = (await httpClient.post(USER_ENDPOINTS.update(values.id), {
    id: values.id,
    username: values.username,
    email: values.email,
    roles: values.roles,
    status: values.status,
  })) as Record<string, unknown>;
  return mapListUser(res);
}

export async function deleteUser(id: string) {
  if (AUTH_MODE === "server") {
    throw new Error("Server API does not support user deletion");
  }
  await httpClient.delete(USER_ENDPOINTS.delete(id));
}

export async function bulkChangeUserRole(ids: string[], role: string) {
  await Promise.all(ids.map((id) => updateUser({ id, roles: [role] })));
}

export async function bulkChangeUserStatus(ids: string[], status: "active" | "locked") {
  await Promise.all(ids.map((id) => updateUser({ id, status })));
}

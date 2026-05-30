import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

import { UserListPage } from "@/modules/user/pages/UserListPage";

const UserSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(20),
  sortField: z.string().nullable().catch(null),
  sortOrder: z.enum(["ascend", "descend"]).nullable().catch(null),
  keyword: z.string().catch(""),
  role: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/users/")({
  validateSearch: (search) => UserSearchParamsSchema.parse(search),
  component: function UsersRoute() {
    const search = Route.useSearch();
    return <UserListPage search={search} routePath={Route.fullPath} />;
  },
});

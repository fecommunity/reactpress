import { USER_ENDPOINTS } from "@/api/user";
import { CreateUserRequestSchema } from "@/api/schemas";
import { extractApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { getToolkitClient } from "@/shared/client";
import { AUTH_MODE } from "@/utils/constants";
import { ApiError, httpClient } from "@/utils/http";

export type RegisterAccountInput = {
  username: string;
  email?: string | null;
  password: string;
};

function rethrowApiError(err: unknown): never {
  const message = extractApiErrorMessage(err);
  if (message) {
    throw new ApiError(400, message);
  }
  throw err;
}

export async function registerAccount(values: RegisterAccountInput): Promise<void> {
  const role = "visitor";

  try {
    if (AUTH_MODE === "server") {
      const api = await getToolkitClient();
      await api.user.register({
        body: {
          name: values.username,
          password: values.password,
          email: values.email ?? null,
          role,
        },
      } as Parameters<typeof api.user.register>[0]);
      return;
    }

    const payload = CreateUserRequestSchema.parse({
      username: values.username,
      email: values.email ?? null,
      roles: [role],
    });

    await httpClient.post(USER_ENDPOINTS.create, {
      ...payload,
      password: values.password,
    });
  } catch (err) {
    rethrowApiError(err);
  }
}

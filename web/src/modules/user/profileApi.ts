import { uploadFile } from "@/shared/api/uploadFile";
import { getToolkitClient } from "@/shared/client";

export type ProfileFormValues = {
  name: string;
  email: string;
  avatar: string | null;
};

export type ProfileUpdateResult = {
  name: string;
  email: string | null;
  avatar: string | null;
};

function resolveUploadUrl(payload: unknown): string {
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (payload && typeof payload === "object" && "url" in payload) {
    const url = (payload as { url?: unknown }).url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  throw new Error("Invalid upload response");
}

export async function uploadAvatar(file: File): Promise<string> {
  const data = await uploadFile(file, 1, "avatar");
  return resolveUploadUrl(data);
}

export async function updateProfile(
  userId: string,
  values: ProfileFormValues,
): Promise<ProfileUpdateResult> {
  const api = await getToolkitClient();
  const res = (await api.user.update({
    body: {
      id: userId,
      name: values.name,
      email: values.email,
      avatar: values.avatar,
    },
  } as Parameters<typeof api.user.update>[0])) as unknown as Record<string, unknown>;

  return {
    name: String(res.name ?? values.name),
    email: (res.email as string | null) ?? values.email ?? null,
    avatar: (res.avatar as string | null) ?? values.avatar ?? null,
  };
}

export async function updateProfilePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const api = await getToolkitClient();
  await api.user.updatePassword({
    body: {
      id: userId,
      oldPassword,
      newPassword,
    },
  } as Parameters<typeof api.user.updatePassword>[0]);
}

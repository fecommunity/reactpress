import { API_BASE_URL } from "@/utils/constants";

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { state?: { tokens?: { accessToken?: string } } };
    const token = parsed.state?.tokens?.accessToken;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // noop
  }
  return {};
}

export async function uploadFile(file: File, unique = 0) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/file/upload?unique=${unique}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  const json = (await res.json()) as {
    success?: boolean;
    code?: number;
    data?: unknown;
    msg?: string;
    message?: string;
  };
  if (!res.ok || json.success === false || (json.code !== undefined && json.code !== 0)) {
    throw new Error(json.msg ?? json.message ?? `Upload failed (${res.status})`);
  }
  return json.data;
}

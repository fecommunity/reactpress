import { useAuthStore } from "@/stores/auth";

export function hasPermission(point: string): boolean {
  return useAuthStore.getState().hasPermission(point);
}

export function usePermission(point: string): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.permissions.includes(point) ?? false;
}

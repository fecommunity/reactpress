import type { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

interface AuthProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Auth({ permission, children, fallback = null }: AuthProps) {
  const allowed = usePermission(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

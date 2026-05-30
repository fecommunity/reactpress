import classNames from "classnames";

type DashiconProps = {
  name: string;
  className?: string;
};

/** Admin icon font. `name` is the suffix, e.g. `dashboard` → `dashicons-dashboard`. */
export function Dashicon({ name, className }: DashiconProps) {
  return <span className={classNames("dashicons", `dashicons-${name}`, className)} aria-hidden />;
}

/** Maps legacy Lucide icon ids and bare names to a Dashicons suffix. */
const ICON_ALIASES: Record<string, string> = {
  IconLucideLayoutDashboard: "dashboard",
  IconLucideBookOpen: "admin-post",
  IconLucideImage: "admin-media",
  IconLucideFileText: "admin-page",
  IconLucideMessageSquare: "admin-comments",
  IconLucideHistory: "admin-comments",
  IconLucideUsers: "admin-users",
  IconLucideUserList: "admin-users",
  IconLucideSettings: "admin-settings",
  IconLucidePalette: "admin-appearance",
  IconLucidePuzzle: "admin-plugins",
  IconLucideWrench: "admin-tools",
  IconLucideBriefcase: "admin-tools",
  IconLucideFolderKanban: "admin-page",
  IconLucideSparkles: "admin-plugins",
  IconLucideStar: "star-filled",
};

export function resolveDashiconName(icon: string | null): string | null {
  if (!icon) return null;
  if (icon.startsWith("dashicons-")) return icon.slice("dashicons-".length);
  return ICON_ALIASES[icon] ?? icon;
}

export function renderDashicon(icon: string | null) {
  const name = resolveDashiconName(icon);
  if (!name) return <Dashicon name="admin-generic" className="admin-sidebar__dashicon" />;
  return <Dashicon name={name} className="admin-sidebar__dashicon" />;
}

import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function SvgIcon({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </SvgIcon>
  );
}

export function NavIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </SvgIcon>
  );
}

export function ArchivesIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 7h6l2 2h10v10H3z" />
    </SvgIcon>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
    </SvgIcon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </SvgIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 11v-2l8-6 8 6v2l-8 10z" />
      <circle cx="7.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
    </SvgIcon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 16H6l2-2V10a4 4 0 0 1 8 0v4z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </SvgIcon>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-3 2-4 3-7 1 2 1 3 2 5z" />
    </SvgIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </SvgIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </SvgIcon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </SvgIcon>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 5h16v11H7l-3 3z" />
    </SvgIcon>
  );
}

export function MenuFoldIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6h16M4 12h10M4 18h16" />
    </SvgIcon>
  );
}

export function MenuUnfoldIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6h16M10 12h10M4 18h16" />
    </SvgIcon>
  );
}

export function ToolIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L3 18l3 3 5.6-5.6a4.5 4.5 0 0 0 6.1-6.1z" />
      <path d="M15 5l4 4" />
    </SvgIcon>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9 8 4 12l5 4" />
      <path d="M15 8l5 4-5 4" />
      <path d="M11 20 13 4" />
    </SvgIcon>
  );
}

const iconMap: Record<string, (props: IconProps) => JSX.Element> = {
  HomeOutlined: HomeIcon,
  home: HomeIcon,
  GlobalOutlined: NavIcon,
  nav: NavIcon,
  ToolOutlined: ToolIcon,
  tool: ToolIcon,
  CodeOutlined: CodeIcon,
  code: CodeIcon,
  HistoryOutlined: ArchivesIcon,
  archives: ArchivesIcon,
  FolderOutlined: FolderIcon,
  folder: FolderIcon,
  TagOutlined: TagIcon,
  tag: TagIcon,
  UserOutlined: UserIcon,
  user: UserIcon,
  SearchOutlined: SearchIcon,
  search: SearchIcon,
  MessageOutlined: MessageIcon,
  message: MessageIcon,
  suggestions: MessageIcon,
  ProfileOutlined: UserIcon,
  profile: UserIcon,
};

export function getIconByName(name?: string | ReactNode) {
  if (!name || typeof name !== 'string') return null;
  return iconMap[name] ?? null;
}

/** Nav category icons — fallback to folder when name is unknown. */
export function getNavIconByName(name?: string) {
  if (!name) return FolderIcon;
  return iconMap[name] ?? FolderIcon;
}

export function getFirstLevelRoute(path: string, locales: string[] = ['zh', 'en']) {
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0])) {
    segments.shift();
    path = segments.length ? `/${segments.join('/')}` : '/';
  }
  const secondSlashIndex = path.indexOf('/', 1);
  return secondSlashIndex === -1 ? path : path.slice(0, secondSlashIndex);
}

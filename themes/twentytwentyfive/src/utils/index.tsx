import * as AntdIcons from '@ant-design/icons';
import {
  ApartmentOutlined as ApartmentIcon,
  AreaChartOutlined as AreaChartIcon,
  BarChartOutlined as BarChartIcon,
  BellOutlined as NotificationIcon,
  BookOutlined as BookIcon,
  CalendarOutlined as CalendarIcon,
  CheckCircleOutlined as CheckCircleIcon,
  ClockCircleOutlined as ClockIcon,
  CloseCircleOutlined as CloseCircleIcon,
  CloudDownloadOutlined as CloudDownloadIcon,
  CloudOutlined as CloudIcon,
  CloudSyncOutlined as CloudSyncIcon,
  CloudUploadOutlined as CloudUploadIcon,
  CodeOutlined as CodeIcon,
  DashboardOutlined as DashboardIcon,
  DeleteOutlined as DeleteIcon,
  DesktopOutlined as DesktopIcon,
  DownloadOutlined as DownloadIcon,
  EditOutlined as EditIcon,
  ExclamationCircleOutlined as ExclamationCircleIcon,
  FileOutlined as FileIcon,
  FolderOpenOutlined as FolderOpenIcon,
  FolderOutlined as FolderIcon,
  FundOutlined as FundIcon,
  GiftOutlined as GiftIcon,
  HomeOutlined as HomeIcon,
  InboxOutlined as InboxIcon,
  InfoCircleOutlined as InfoCircleIcon,
  LaptopOutlined as LaptopIcon,
  LikeOutlined as LikeIcon,
  LineChartOutlined as LineChartIcon,
  LoadingOutlined as LoadingIcon,
  LockOutlined as LockIcon,
  LogoutOutlined as LogoutIcon,
  MailOutlined as MailIcon,
  MessageOutlined as MessageIcon,
  MobileOutlined as MobileIcon,
  PaperClipOutlined as PaperClipIcon,
  PhoneOutlined as PhoneIcon,
  PieChartOutlined as PieChartIcon,
  PlusOutlined as AddIcon,
  PrinterOutlined as PrinterIcon,
  ProfileOutlined as ProfileIcon,
  QuestionCircleOutlined as QuestionCircleIcon,
  RedoOutlined as RedoIcon,
  RocketOutlined as RocketIcon,
  SaveOutlined as SaveIcon,
  SearchOutlined as SearchIcon,
  SettingOutlined as SettingsIcon,
  ShareAltOutlined as ShareIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
  SkinOutlined as SkinIcon,
  SolutionOutlined as SolutionIcon,
  StarOutlined as StarIcon,
  TagOutlined as TagIcon,
  TagsOutlined as TagsIcon,
  TeamOutlined as TeamIcon,
  UndoOutlined as UndoIcon,
  UploadOutlined as UploadIcon,
  UserOutlined as UserIcon,
  WifiOutlined as WifiIcon,
} from '@ant-design/icons';
import React from 'react';

const iconMap = {
  suggestions: MessageIcon,
  github: CodeIcon,
  home: HomeIcon,
  settings: SettingsIcon,
  user: UserIcon,
  lock: LockIcon,
  logout: LogoutIcon,
  search: SearchIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  add: AddIcon,
  save: SaveIcon,
  undo: UndoIcon,
  redo: RedoIcon,
  notification: NotificationIcon,
  message: MessageIcon,
  like: LikeIcon,
  star: StarIcon,
  share: ShareIcon,
  pieChart: PieChartIcon,
  barChart: BarChartIcon,
  lineChart: LineChartIcon,
  areaChart: AreaChartIcon,
  checkCircle: CheckCircleIcon,
  closeCircle: CloseCircleIcon,
  infoCircle: InfoCircleIcon,
  exclamationCircle: ExclamationCircleIcon,
  questionCircle: QuestionCircleIcon,
  loading: LoadingIcon,
  file: FileIcon,
  folder: FolderIcon,
  folderOpen: FolderOpenIcon,
  upload: UploadIcon,
  download: DownloadIcon,
  dashboard: DashboardIcon,
  profile: ProfileIcon,
  team: TeamIcon,
  mail: MailIcon,
  phone: PhoneIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  printer: PrinterIcon,
  tag: TagIcon,
  tags: TagsIcon,
  book: BookIcon,
  cloud: CloudIcon,
  cloudDownload: CloudDownloadIcon,
  cloudUpload: CloudUploadIcon,
  cloudSync: CloudSyncIcon,
  wifi: WifiIcon,
  desktop: DesktopIcon,
  laptop: LaptopIcon,
  mobile: MobileIcon,
  inbox: InboxIcon,
  paperClip: PaperClipIcon,
  solution: SolutionIcon,
  apartment: ApartmentIcon,
  rocket: RocketIcon,
  fund: FundIcon,
  shoppingCart: ShoppingCartIcon,
  gift: GiftIcon,
  skin: SkinIcon,
};

// 统一的颜色数组，避免重复
const colors = [
  '#52c41a', '#f5222d', '#1890ff', '#faad14', '#ff0064', '#722ed1',
  '#dc3545', '#17a2b8', '#00b74a', '#fc651f', '#6c757d', '#f5c800',
  '#808695', '#2db7f5', '#87d068', '#108ee9'
];

export const getRandomColor = (() => {
  const cache = {};
  return (key): string => {
    if (!cache[key]) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      cache[key] = color;
      return color;
    }
    return cache[key];
  };
})();

export function elementInViewport(el) {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  const width = el.offsetWidth;
  const height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top < window.pageYOffset + window.innerHeight &&
    left < window.pageXOffset + window.innerWidth &&
    top + height > window.pageYOffset &&
    left + width > window.pageXOffset
  );
}

export function getDocumentScrollTop() {
  return document.documentElement.scrollTop || window.pageYOffset || window.scrollY || document.body.scrollTop;
}

export const groupBy = function (data, condition) {
  if (!condition || !Array.isArray(data)) {
    return data;
  }
  const result = Object.create(null);
  let key = null;

  data.forEach((item, i, arr) => {
    key = condition(item, i, arr);
    if (key === null || key === undefined) {
      return;
    }
    if (result[key]) {
      result[key].push(item);
    } else {
      result[key] = [item];
    }
  });

  return result;
};

export const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' Byte';
  }
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  }
  return (size / 1024 / 1024).toFixed(2) + ' MB';
};

export function resolveUrl(baseURL, relativeURL) {
  if (!baseURL) {
    baseURL = '/';
  }

  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}

export const isOdd = (v) => v % 2 !== 0;

export const scrollToBottom = (el: HTMLElement) => {
  const currentScrollTop = el.scrollTop;
  const clientHeight = el.offsetHeight;
  const scrollHeight = el.scrollHeight;

  el.scrollTo(0, currentScrollTop + (scrollHeight - currentScrollTop - clientHeight));
};

export function getColorFromNumber(num) {
  const index = num % colors.length;
  return colors[index];
}

export function getIconByName (name) {
  if (React.isValidElement(name)) {
    return name;
  }
  const IconComponent = AntdIcons?.[name] || iconMap[name] || null;
  return IconComponent;
};

export function getFirstLevelRoute(path, locales: string[] = ['zh', 'en']) {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  if (path.endsWith('/') && path.length > 1) {
    path = path.slice(0, -1);
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0])) {
    segments.shift();
    path = segments.length ? `/${segments.join('/')}` : '/';
  }

  const secondSlashIndex = path.indexOf('/', 1);
  return secondSlashIndex === -1 ? path : path.slice(0, secondSlashIndex);
}
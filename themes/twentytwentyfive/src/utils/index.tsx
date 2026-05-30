import * as AntdIcons from '@ant-design/icons';
import React from 'react';

import {
  CodeOutlined as CodeIcon,
  HomeOutlined as HomeIcon,
  SettingOutlined as SettingsIcon,
  UserOutlined as UserIcon,
  LockOutlined as LockIcon,
  LogoutOutlined as LogoutIcon,
  SearchOutlined as SearchIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  PlusOutlined as AddIcon,
  SaveOutlined as SaveIcon,
  UndoOutlined as UndoIcon,
  RedoOutlined as RedoIcon,
  BellOutlined as NotificationIcon,
  MessageOutlined as MessageIcon,
  LikeOutlined as LikeIcon,
  StarOutlined as StarIcon,
  ShareAltOutlined as ShareIcon,
  PieChartOutlined as PieChartIcon,
  BarChartOutlined as BarChartIcon,
  LineChartOutlined as LineChartIcon,
  AreaChartOutlined as AreaChartIcon,
  CheckCircleOutlined as CheckCircleIcon,
  CloseCircleOutlined as CloseCircleIcon,
  InfoCircleOutlined as InfoCircleIcon,
  ExclamationCircleOutlined as ExclamationCircleIcon,
  QuestionCircleOutlined as QuestionCircleIcon,
  LoadingOutlined as LoadingIcon,
  FileOutlined as FileIcon,
  FolderOutlined as FolderIcon,
  FolderOpenOutlined as FolderOpenIcon,
  UploadOutlined as UploadIcon,
  DownloadOutlined as DownloadIcon,
  DashboardOutlined as DashboardIcon,
  ProfileOutlined as ProfileIcon,
  TeamOutlined as TeamIcon,
  MailOutlined as MailIcon,
  PhoneOutlined as PhoneIcon,
  CalendarOutlined as CalendarIcon,
  ClockCircleOutlined as ClockIcon,
  PrinterOutlined as PrinterIcon,
  TagOutlined as TagIcon,
  TagsOutlined as TagsIcon,
  BookOutlined as BookIcon,
  CloudOutlined as CloudIcon,
  CloudDownloadOutlined as CloudDownloadIcon,
  CloudUploadOutlined as CloudUploadIcon,
  CloudSyncOutlined as CloudSyncIcon,
  WifiOutlined as WifiIcon,
  DesktopOutlined as DesktopIcon,
  LaptopOutlined as LaptopIcon,
  MobileOutlined as MobileIcon,
  InboxOutlined as InboxIcon,
  PaperClipOutlined as PaperClipIcon,
  SolutionOutlined as SolutionIcon,
  ApartmentOutlined as ApartmentIcon,
  RocketOutlined as RocketIcon,
  FundOutlined as FundIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
  GiftOutlined as GiftIcon,
  SkinOutlined as SkinIcon,
} from '@ant-design/icons';

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

export function getFirstLevelRoute(path) {
  // 确保路径以斜杠开头，如果不是则添加斜杠
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // 去除路径末尾的斜杠（如果有的话）
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 查找第一个斜杠之后和下一个斜杠（如果有）之前的部分
  const firstSlashIndex = path.indexOf('/'); // 实际上这个索引在这里总是0
  const secondSlashIndex = path.indexOf('/', firstSlashIndex + 1);

  // 如果没有找到第二个斜杠，说明路径只有一级
  const finalPath = secondSlashIndex === -1 ? path : path.slice(0, secondSlashIndex);
  return finalPath || '/';
}
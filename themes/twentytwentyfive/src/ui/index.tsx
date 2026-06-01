import cls from 'classnames';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import s from './ui.module.scss';

/* ---------- message ---------- */
type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  text: string;
  type: ToastType;
}

let toastId = 0;
let pushToast: ((text: string, type: ToastType) => void) | null = null;

function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (text, type) => {
      const id = ++toastId;
      setItems((prev) => [...prev, { id, text, type }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2800);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  if (typeof document === 'undefined' || !items.length) return null;

  return createPortal(
    <div className={s.toastHost} role="status" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={cls(s.toast, item.type === 'error' && s.toastError, item.type === 'success' && s.toastSuccess)}
        >
          {item.text}
        </div>
      ))}
    </div>,
    document.body,
  );
}

export const message = {
  success: (text: string) => pushToast?.(text, 'success'),
  error: (text: string) => pushToast?.(text, 'error'),
  info: (text: string) => pushToast?.(text, 'info'),
};

export function MessageHost() {
  return <ToastHost />;
}

/* ---------- Button ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  type?: 'default' | 'primary' | 'text';
  size?: 'middle' | 'large' | 'small';
  loading?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  block?: boolean;
};

export function Button({
  type = 'default',
  size = 'middle',
  loading,
  htmlType = 'button',
  className,
  children,
  icon,
  block,
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      type={htmlType}
      disabled={disabled || loading}
      className={cls(
        s.btn,
        type === 'primary' && s.btnPrimary,
        type === 'text' && s.btnText,
        size === 'large' && s.btnLarge,
        size === 'middle' && s.btnMiddle,
        loading && s.btnLoading,
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------- Input ---------- */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: 'middle' | 'large';
  allowClear?: boolean;
  onPressEnter?: () => void;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size, className, allowClear, value, onChange, onPressEnter, ...rest },
  ref,
) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onPressEnter?.();
    rest.onKeyDown?.(e);
  };

  return (
    <input
      ref={ref}
      className={cls(s.input, size === 'large' && s.inputLarge, className)}
      value={value}
      onChange={onChange}
      onKeyDown={handleKey}
      {...rest}
    />
  );
});

Input.Password = React.forwardRef<HTMLInputElement, InputProps>(function Password(props, ref) {
  return <Input ref={ref} type="password" {...props} />;
});

type SearchProps = InputProps & {
  loading?: boolean;
  onSearch?: (value: string) => void;
  enterButton?: ReactNode;
};

Input.Search = React.forwardRef<HTMLInputElement, SearchProps>(function Search(
  { onSearch, loading, enterButton, onPressEnter, ...rest },
  ref,
) {
  const search = () => {
    const el = (ref as React.RefObject<HTMLInputElement>)?.current;
    onSearch?.(el?.value ?? '');
  };

  return (
    <div className={s.compact}>
      <Input ref={ref} {...rest} onPressEnter={() => (onPressEnter?.(), search())} />
      {enterButton ?? (
        <Button type="primary" onClick={search} loading={loading}>
          Search
        </Button>
      )}
    </div>
  );
});

/* ---------- Modal ---------- */
interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode | null;
  onCancel?: () => void;
  onOk?: () => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  width?: number | string;
  className?: string;
  rootClassName?: string;
  wrapClassName?: string;
  destroyOnHidden?: boolean;
}

export function Modal({
  open,
  title,
  children,
  footer,
  onCancel,
  onOk,
  okText = 'OK',
  cancelText = 'Cancel',
  className,
  rootClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const defaultFooter =
    footer === undefined ? (
      <div className={s.modalFooter}>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button type="primary" onClick={onOk}>
          {okText}
        </Button>
      </div>
    ) : (
      footer
    );

  return (
    <div className={cls(s.modalMask, rootClassName)} role="dialog" aria-modal onClick={onCancel}>
      <div className={cls(s.modal, className)} onClick={(e) => e.stopPropagation()}>
        {title ? <div className={s.modalHeader}>{title}</div> : null}
        <div className={s.modalBody}>{children}</div>
        {defaultFooter}
      </div>
    </div>
  );
}

/* ---------- Spin, Tag, Alert, Avatar ---------- */
export function Spin({ size }: { size?: 'small' | 'default' }) {
  return <span className={cls(s.spin, size === 'small' && s.spinSmall)} role="status" aria-label="Loading" />;
}

export function Tag({
  children,
  color,
  className,
  icon,
}: {
  children?: ReactNode;
  color?: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span className={cls(s.tag, className)} style={color ? { backgroundColor: color } : undefined}>
      {icon}
      {children}
    </span>
  );
}

export function Alert({
  message,
  type = 'info',
  icon,
  className,
  banner,
  closeIcon,
}: {
  message?: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  className?: string;
  banner?: boolean;
  closeIcon?: boolean;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div className={cls(s.alert, type === 'info' && s.alertInfo, banner && 'w-full', className)} role="alert">
      {icon}
      <div className="flex-1">{message}</div>
      {closeIcon ? (
        <button type="button" className={s.btnText} onClick={() => setClosed(true)} aria-label="Close">
          ×
        </button>
      ) : null}
    </div>
  );
}

export function Avatar({
  src,
  alt,
  size = 32,
  children,
  icon,
}: {
  src?: string;
  alt?: string;
  size?: number;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className={s.avatar} style={{ width: size, height: size }} aria-hidden={!alt}>
      {src ? <img src={src} alt={alt ?? ''} width={size} height={size} /> : children ?? icon}
    </span>
  );
}

/* ---------- Breadcrumb ---------- */
function BreadcrumbItem({ children }: { children?: ReactNode }) {
  return <li className="inline-flex items-center gap-1">{children}</li>;
}

export function Breadcrumb({
  items,
  children,
}: {
  items?: { title: ReactNode; href?: string }[];
  children?: ReactNode;
}) {
  if (items?.length) {
    return (
      <ol className={s.breadcrumb}>
        {items.map((item, i) => (
          <li key={i} className="inline-flex items-center gap-1">
            {i > 0 ? <span className={s.breadcrumbSep}>/</span> : null}
            {item.href ? <a href={item.href}>{item.title}</a> : <span>{item.title}</span>}
          </li>
        ))}
      </ol>
    );
  }
  return <ol className={s.breadcrumb}>{children}</ol>;
}

Breadcrumb.Item = BreadcrumbItem;

/* ---------- Card, Divider, Popover ---------- */
export function Card({ title, children, className }: { title?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cls(s.card, className)}>
      {title ? <div className={s.cardTitle}>{title}</div> : null}
      <div className={s.cardBody}>{children}</div>
    </div>
  );
}

export function Divider({ type, dashed }: { type?: 'vertical'; dashed?: boolean }) {
  if (type === 'vertical') return <span className={s.dividerVertical} aria-hidden />;
  return <hr className={cls(s.divider, dashed && 'border-dashed')} />;
}

export function Popover({ content, children }: { content?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={s.popoverWrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && content ? <span className={s.popoverPanel}>{content}</span> : null}
    </span>
  );
}

/* ---------- Dropdown ---------- */
export function Dropdown({
  menu,
  children,
}: {
  menu: { items: { key: string; label: ReactNode }[]; onClick?: (arg: { key: string }) => void };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <span className={s.dropdown} ref={ref}>
      <span onClick={() => setOpen((v) => !v)}>{children}</span>
      {open ? (
        <div className={s.dropdownMenu} role="menu">
          {menu.items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={s.dropdownItem}
              role="menuitem"
              onClick={() => {
                menu.onClick?.({ key: item.key });
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({
  activeKey,
  items = [],
  onChange,
  className,
  style,
}: {
  activeKey?: string;
  items?: { key: string; label: ReactNode }[];
  onChange?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cls(s.tabs, className)} style={style} role="tablist">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          data-active={activeKey === item.key}
          className={s.tab}
          onClick={() => onChange?.(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- AutoComplete ---------- */
export function AutoComplete({
  options = [],
  onChange,
  onFocus,
  optionRender,
  notFoundContent,
  children,
  className,
  popupClassName,
}: {
  options?: Record<string, unknown>[];
  onChange?: (val: string) => void;
  onFocus?: () => void;
  optionRender?: (record: Record<string, unknown>, info: { index: number }) => ReactNode;
  notFoundContent?: ReactNode;
  children: ReactNode;
  className?: string;
  popupClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div className={cls(s.autocomplete, className)}>
      {React.cloneElement(children as React.ReactElement, {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
          setOpen(true);
        },
        onFocus: () => {
          onFocus?.();
          setOpen(true);
        },
      })}
      {open && options.length ? (
        <div className={cls(s.autocompletePanel, popupClassName)}>
          {options.map((opt, index) => (
            <div key={index} className={s.autocompleteOption} onMouseDown={() => setOpen(false)}>
              {optionRender ? optionRender(opt, { index }) : String(opt.label ?? opt.value)}
            </div>
          ))}
        </div>
      ) : (
        notFoundContent
      )}
    </div>
  );
}

/* ---------- Badge, Result, Pagination ---------- */
export function Badge({
  count,
  children,
  style,
}: {
  count?: number;
  children: ReactNode;
  size?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={s.badge}>
      {children}
      {count != null && count > 0 ? (
        <span className={s.badgeCount} style={style}>
          {count}
        </span>
      ) : null}
    </span>
  );
}

export function Result({
  status = '404',
  title,
  subTitle,
  extra,
}: {
  status?: string | number;
  title?: ReactNode;
  subTitle?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className={s.result}>
      <p className={s.resultTitle}>{status}</p>
      {title ? <h1 className="text-xl font-semibold m-0">{title}</h1> : null}
      {subTitle ? <p className={s.resultSub}>{subTitle}</p> : null}
      {extra}
    </div>
  );
}

interface PaginationProps {
  total: number;
  current?: number;
  page?: number;
  pageSize?: number;
  size?: string;
  hideOnSinglePage?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  showTotal?: (total: number) => ReactNode;
  onChange?: (page: number, pageSize?: number) => void;
  onShowSizeChange?: (page: number, pageSize: number) => void;
}

export function Pagination({
  total,
  current,
  page,
  pageSize = 10,
  hideOnSinglePage,
  onChange,
}: PaginationProps) {
  const cur = current ?? page ?? 1;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (hideOnSinglePage && pages <= 1) return null;

  const go = (p: number) => onChange?.(p, pageSize);

  return (
    <nav className={s.pagination} aria-label="Pagination">
      <button type="button" className={s.pageBtn} disabled={cur <= 1} onClick={() => go(cur - 1)}>
        ‹
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            type="button"
            className={s.pageBtn}
            data-active={p === cur}
            onClick={() => go(p)}
          >
            {p}
          </button>
        );
      })}
      <button type="button" className={s.pageBtn} disabled={cur >= pages} onClick={() => go(cur + 1)}>
        ›
      </button>
    </nav>
  );
}

/* ---------- Flex, Space, Form, List, Menu, BackTop ---------- */
export function Flex({
  children,
  wrap,
  gap,
  className,
}: {
  children: ReactNode;
  wrap?: boolean | string;
  gap?: string | number;
  className?: string;
}) {
  return (
    <div
      className={cls(s.flex, wrap && s.flexWrap, gap === 'small' && s.gapSmall, className)}
      style={typeof gap === 'number' ? { gap } : undefined}
    >
      {children}
    </div>
  );
}

export const Space = {
  Compact: ({ children, block, className }: { children: ReactNode; block?: boolean; className?: string }) => (
    <div className={cls(s.compact, block && 'w-full', className)}>{children}</div>
  ),
};

const FormContext = createContext<{ errors: Record<string, string> }>({ errors: {} });

function FormItem({
  name,
  label,
  children,
  style,
}: {
  name?: string;
  label?: ReactNode;
  rules?: { required?: boolean; message?: string; type?: string }[];
  children: React.ReactElement;
  style?: React.CSSProperties;
  dependencies?: string[];
}) {
  const { errors } = useContext(FormContext);
  const err = name ? errors[name] : undefined;
  const child = name
    ? React.cloneElement(children, { name, ...(children.props as object) })
    : children;
  return (
    <div className={s.formItem} style={style}>
      {label ? <label className="block mb-1 text-sm">{label}</label> : null}
      {child}
      {err ? <p className={s.formError}>{err}</p> : null}
    </div>
  );
}

interface FormRootProps {
  name?: string;
  onFinish?: (values: Record<string, string>) => void;
  children: ReactNode;
}

function FormComponent({ onFinish, children }: FormRootProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    fd.forEach((v, k) => {
      values[k] = String(v);
    });
    setErrors({});
    onFinish?.(values);
  };

  return (
    <FormContext.Provider value={{ errors }}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
}

FormComponent.Item = FormItem;
export { FormComponent as Form };

function ListItemMeta({
  avatar,
  title,
  description,
  className,
}: {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cls(s.listItem, className)}>
      {avatar}
      <div>
        <div className={s.listMetaTitle}>{title}</div>
        {description ? <div className={s.listMetaDesc}>{description}</div> : null}
      </div>
    </div>
  );
}

function ListItemLi({ children, className }: { children?: ReactNode; className?: string }) {
  return <li className={className}>{children}</li>;
}

ListItemLi.Meta = ListItemMeta;

export const List = { Item: ListItemLi };

export function ListGrid({
  dataSource = [],
  renderItem,
}: {
  dataSource?: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
  grid?: Record<string, number>;
}) {
  return (
    <ul className={s.listGrid}>
      {dataSource.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

export function Menu({
  items = [],
  onClick,
  inlineCollapsed,
  className,
}: {
  items?: { key: string; label: ReactNode; icon?: ReactNode }[];
  onClick?: (arg: { key: string }) => void;
  inlineCollapsed?: boolean;
  className?: string;
  mode?: string;
  theme?: string;
}) {
  return (
    <nav className={cls(s.menu, inlineCollapsed && s.menuCollapsed, className)}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={s.menuItem}
          onClick={() => onClick?.({ key: item.key })}
        >
          {item.icon}
          <span className={s.menuLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function BackTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={s.backTop}
      data-visible={visible}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}

export const FloatButton = { BackTop };

export function TextLoop({ children, interval = 5000 }: { children: ReactNode; interval?: number }) {
  const items = React.Children.toArray(children);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => window.clearInterval(id);
  }, [items.length, interval]);

  return <div className={s.textLoop}>{items[index]}</div>;
}

export function ListTrail({
  length,
  renderItem,
}: {
  length: number;
  options?: Record<string, unknown>;
  element?: string;
  setItemContainerProps?: (index: number) => Record<string, unknown>;
  renderItem: (index: number) => ReactNode;
}) {
  return (
    <>
      {Array.from({ length }, (_, index) => (
        <li key={index} className={s.fadeIn}>
          {renderItem(index)}
        </li>
      ))}
    </>
  );
}

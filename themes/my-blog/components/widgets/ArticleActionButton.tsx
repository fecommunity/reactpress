'use client';

import type { ReactNode } from 'react';

export type ArticleActionVariant = 'floating' | 'inline' | 'mobile';

interface ArticleActionButtonProps {
  active?: boolean;
  disabled?: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  variant?: ArticleActionVariant;
  activeClassName?: string;
  children: ReactNode;
}

export default function ArticleActionButton({
  active = false,
  disabled = false,
  label,
  count,
  onClick,
  variant = 'floating',
  activeClassName = 'is-liked',
  children,
}: ArticleActionButtonProps) {
  const className = [
    'rp-action-btn',
    variant === 'inline' ? 'rp-action-btn--inline' : '',
    variant === 'mobile' ? 'rp-action-btn--mobile' : '',
    active ? activeClassName : '',
    disabled ? 'is-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'inline') {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={className}
      >
        <span className="rp-action-btn__icon" aria-hidden>
          {children}
        </span>
        <span className="rp-action-btn__label">{label}</span>
        {count != null && count > 0 ? (
          <span className="rp-action-btn__count">{count}</span>
        ) : null}
      </button>
    );
  }

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={className}
      >
        <span className="rp-action-btn__icon" aria-hidden>
          {children}
        </span>
        <span className="rp-action-btn__mobile-label">{label}</span>
        {count != null && count > 0 ? (
          <span className="rp-action-btn__mobile-count">{count}</span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <span className="rp-action-btn__icon" aria-hidden>
        {children}
      </span>
      {count != null ? (
        <span className="rp-action-btn__count-below">{count > 0 ? count : ''}</span>
      ) : null}
    </button>
  );
}

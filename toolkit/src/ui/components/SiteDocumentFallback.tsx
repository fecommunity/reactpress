import React from 'react';
import { SiteDocument, type SiteDocumentProps } from './SiteDocument';

export interface SiteDocumentFallbackProps extends Omit<SiteDocumentProps, 'children'> {
  message?: React.ReactNode;
  messageClassName?: string;
}

/** Standard ISR fallback shell while on-demand pages compile. */
export function SiteDocumentFallback({
  message = 'Loading…',
  messageClassName = 'empty-state',
  ...shell
}: SiteDocumentFallbackProps) {
  return (
    <SiteDocument {...shell}>
      <p className={messageClassName}>{message}</p>
    </SiteDocument>
  );
}

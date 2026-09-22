'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ className, style, icons, ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className={cn('toaster group', className)}
      position="top-center"
      icons={{
        success: (
          <CircleCheckIcon
            fill="currentColor"
            className="size-4 text-success [&>:not(circle)]:stroke-(--normal-bg)"
          />
        ),
        info: (
          <InfoIcon
            fill="currentColor"
            className="size-4 text-info [&>:not(circle)]:stroke-(--normal-bg)"
          />
        ),
        warning: (
          <CircleAlertIcon
            fill="currentColor"
            className="size-4 text-warning [&>:not(circle)]:stroke-(--normal-bg)"
          />
        ),
        error: (
          <CircleXIcon
            fill="currentColor"
            className="size-4 text-destructive [&>:not(circle)]:stroke-(--normal-bg)"
          />
        ),
        close: <XIcon className="size-4 text-accent-foreground" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
        ...icons,
      }}
      style={
        {
          '--normal-bg': '#ffffff',
          '--normal-text': '#000000',
          '--normal-border': '#000000',
          '--border-radius': '1rem',
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: '#fff',
          color: '#000',
          border: '4px solid #000',
          borderRadius: '1rem',
          boxShadow: '6px 6px 0 0 #000',
          fontWeight: 800,
        },
      }}
      {...props}
    />
  );
}

export { Toaster };

import {
  ErrorBoundary as ReactErrorBoundary,
  type FallbackProps,
} from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Button } from '@/components/ui/button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message =
    error instanceof Error ? error.message : '发生了未知错误，请尝试刷新页面';
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            页面加载出错了
          </h2>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetErrorBoundary} variant="default">
            <RefreshCw className="size-4" />
            重试
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function ErrorBoundary({ children, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: Error) => {
        logger.error('页面错误边界捕获异常', error);
      }}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

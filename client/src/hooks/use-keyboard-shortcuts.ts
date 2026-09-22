import { useEffect } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

interface KeyboardShortcutsOptions {
  /** N 键：触发新建记录 */
  onNewEntry?: () => void;
  /** / 键：聚焦搜索框 */
  onFocusSearch?: () => void;
  /** Esc 键：关闭弹窗/抽屉 */
  onEscape?: () => void;
  /** 是否启用，默认 true */
  enabled?: boolean;
}

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (INPUT_TAGS.has(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * 全局键盘快捷键 hook
 * - N 键：触发新建记录
 * - / 键：聚焦搜索框
 * - Esc 键：关闭弹窗/抽屉
 * 输入框内不触发
 */
export function useKeyboardShortcuts({
  onNewEntry,
  onFocusSearch,
  onEscape,
  enabled = true,
}: KeyboardShortcutsOptions = {}) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 输入框内不触发（Esc 除外，Esc 始终可用）
      const inEditable = isEditableTarget(e.target);

      // Esc
      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape();
        }
        return;
      }

      if (inEditable) return;

      // / 键聚焦搜索
      if (e.key === '/') {
        if (onFocusSearch) {
          e.preventDefault();
          onFocusSearch();
        }
        return;
      }

      // N 键新建记录（不区分大小写，但避免组合键）
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (onNewEntry) {
          e.preventDefault();
          onNewEntry();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNewEntry, onFocusSearch, onEscape, enabled]);

  // 便于调试时确认 hook 已挂载
  useEffect(() => {
    if (enabled) {
      logger.debug('keyboard shortcuts enabled');
    }
  }, [enabled]);
}

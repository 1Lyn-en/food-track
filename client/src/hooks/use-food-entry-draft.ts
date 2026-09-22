import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { CreateFoodEntryRequest } from '@shared/api.interface';

const DRAFT_KEY = 'food-map:draft';
const DEBOUNCE_MS = 500;

type DraftData = Partial<CreateFoodEntryRequest>;

function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftData;
    return parsed;
  } catch (error) {
    logger.error('读取美食记录草稿失败', error);
    return null;
  }
}

function saveDraftToStorage(data: DraftData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error('保存美食记录草稿失败', error);
  }
}

function clearDraftFromStorage(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    logger.error('清除美食记录草稿失败', error);
  }
}

export function useFoodEntryDraft() {
  const [draft, setDraft] = useState<DraftData | null>(() => loadDraft());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraft = useCallback((data: DraftData) => {
    setDraft(data);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveDraftToStorage(data);
    }, DEBOUNCE_MS);
  }, []);

  const clearDraft = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    clearDraftFromStorage();
    setDraft(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { draft, saveDraft, clearDraft };
}

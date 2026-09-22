import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Upload, Table2 } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

import { useImportFoodEntries } from '@/api/food-entries';
import type {
  ImportFoodEntryItem,
  ImportFoodEntryRequest,
} from '@shared/api.interface';
import { parseXlsxFile, parseJsonEntries } from './xlsx-utils';
import { BitableImportForm } from './BitableImportForm';

type ImportSource = 'file' | 'bitable';
type ImportMode = 'merge' | 'replace';

interface ImportPreview {
  entryCount: number;
  tagCount: number;
  entries: ImportFoodEntryItem[];
}

function countTags(entries: ImportFoodEntryItem[]): number {
  const set = new Set<string>();
  entries.forEach((entry) => {
    entry.tagNames?.forEach((name: string) => set.add(name));
  });
  return set.size;
}

export function ImportTab() {
  const [source, setSource] = useState<ImportSource>('file');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mode, setMode] = useState<ImportMode>('merge');
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportFoodEntries();

  const applyEntries = (entries: ImportFoodEntryItem[]): void => {
    if (entries.length === 0) {
      toast.error('文件中没有有效的美食记录（需至少包含菜名和店名）');
      return;
    }
    setPreview({
      entryCount: entries.length,
      tagCount: countTags(entries),
      entries,
    });
    toast.success(`解析成功，共 ${entries.length} 条记录`);
  };

  const handleFile = (file: File): void => {
    const name = file.name.toLowerCase();
    const isJson = name.endsWith('.json');
    const isXlsx = name.endsWith('.xlsx');
    if (!isJson && !isXlsx) {
      toast.error('请选择 JSON 或 Excel（.xlsx）格式文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件过大，请选择小于 10MB 的文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>): Promise<void> => {
      try {
        if (isXlsx) {
          const entries = await parseXlsxFile(e.target?.result as ArrayBuffer);
          applyEntries(entries);
        } else {
          const entries = parseJsonEntries(e.target?.result as string);
          applyEntries(entries);
        }
      } catch (error) {
        logger.error('解析导入文件失败', error);
        toast.error(
          isXlsx
            ? '文件解析失败，请确认是有效的 Excel 文件'
            : '文件解析失败，请确认是有效的 JSON 文件',
        );
      }
    };
    reader.onerror = (): void => {
      toast.error('文件读取失败');
    };
    if (isXlsx) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = (): void => {
    if (!preview) return;
    setConfirmOpen(true);
  };

  const confirmImport = (): void => {
    if (!preview) return;
    const payload: ImportFoodEntryRequest = {
      entries: preview.entries,
      mode,
    };
    importMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`导入成功，共 ${res.importedCount} 条记录`);
        setPreview(null);
        setConfirmOpen(false);
      },
      onError: () => {
        toast.error('导入失败，请重试');
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>导入来源</Label>
        <RadioGroup
          value={source}
          onValueChange={(v: string) => {
            setSource(v as ImportSource);
            setPreview(null);
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="file" id="source-file" />
            <Label htmlFor="source-file" className="cursor-pointer">
              <Upload className="mr-1 inline size-4" />
              文件导入
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bitable" id="source-bitable" />
            <Label htmlFor="source-bitable" className="cursor-pointer">
              <Table2 className="mr-1 inline size-4" />
              飞书多维表格
            </Label>
          </div>
        </RadioGroup>
      </div>

      {source === 'file' ? (
        <>
          <div
            onDragOver={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors',
              isDragging
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-accent/30',
            )}
          >
            <Upload className="size-8 text-muted-foreground" />
            <div className="text-sm font-medium">
              拖拽文件到此处，或点击选择
            </div>
            <div className="text-xs text-muted-foreground">
              支持 .json 与 .xlsx 格式文件
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleInputChange}
            className="hidden"
          />
        </>
      ) : (
        <BitableImportForm onEntriesLoaded={applyEntries} />
      )}

      {preview && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">导入预览</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreview(null)}
              className="h-7 text-xs"
            >
              重新选择
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-accent/50 p-3 text-center">
              <div className="text-xl font-semibold text-primary">
                {preview.entryCount}
              </div>
              <div className="text-xs text-muted-foreground">条记录</div>
            </div>
            <div className="rounded-lg bg-accent/50 p-3 text-center">
              <div className="text-xl font-semibold text-primary">
                {preview.tagCount}
              </div>
              <div className="text-xs text-muted-foreground">个标签</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>导入模式</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v: string) => setMode(v as ImportMode)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="mode-merge" />
                <Label htmlFor="mode-merge" className="cursor-pointer">
                  合并 — 追加到现有数据中
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="mode-replace" />
                <Label htmlFor="mode-replace" className="cursor-pointer">
                  替换 — 清空现有数据后导入
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleImport}
            className="w-full"
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? '导入中...' : '开始导入'}
          </Button>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认导入？</AlertDialogTitle>
            <AlertDialogDescription>
              {mode === 'merge'
                ? `将合并导入 ${preview?.entryCount ?? 0} 条记录，不会删除现有数据。`
                : `将先清空所有现有数据，再导入 ${preview?.entryCount ?? 0} 条记录。此操作不可撤销。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmImport}
              className={cn(
                mode === 'replace' && 'bg-destructive hover:bg-destructive/90',
              )}
            >
              确认导入
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

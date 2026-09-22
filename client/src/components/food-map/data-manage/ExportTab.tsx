import { useState } from 'react';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Sheet,
  Table2,
  CheckCircle2,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { FoodEntry } from '@shared/api.interface';
import { exportEntriesToXlsx } from './xlsx-utils';

type ExportFormat = 'json' | 'csv' | 'xlsx' | 'bitable';

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { value: 'xlsx', label: 'Excel', desc: '表格，可直接编辑', icon: Sheet },
  { value: 'json', label: 'JSON', desc: '完整数据备份', icon: FileJson },
  { value: 'csv', label: 'CSV', desc: '通用表格文本', icon: FileSpreadsheet },
  { value: 'bitable' as const, label: '飞书表格', desc: '同步到多维表格', icon: Table2 },
];

export function ExportTab() {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [exporting, setExporting] = useState(false);
  const [appToken, setAppToken] = useState('');
  const [tableID, setTableID] = useState('');

  const downloadViaBackend = (fmt: 'json' | 'csv'): void => {
    const url = `/api/food-entries/export?format=${fmt}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `food-entries.${fmt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportXlsx = async (): Promise<void> => {
    const response = await axiosForBackend({
      url: '/api/food-entries/export?format=json',
      method: 'GET',
    });
    const data = response.data;
    const entries: FoodEntry[] =
      typeof data === 'string' ? JSON.parse(data) : data;
    exportEntriesToXlsx(entries, `food-entries-${Date.now()}.xlsx`);
  };

  const exportBitable = async (entries: FoodEntry[]): Promise<void> => {
    const records = entries.map((entry: FoodEntry) => ({
      record: {
        菜名: entry.dishName,
        餐厅: entry.restaurantName,
        地址: entry.address,
        纬度: entry.latitude,
        经度: entry.longitude,
        评分: entry.rating,
        备注: entry.note || '',
        用餐日期: new Date(entry.visitDate).getTime(),
        收藏: entry.favorite ?? false,
        标签: (entry.tags ?? []).map((t: { name: string }) => t.name).join('/'),
      },
    }));

    const BATCH = 500;
    for (let i = 0; i < records.length; i += BATCH) {
      await capabilityClient
        .load('food_trace_bitable_import_export_1')
        .call('batchAddRecords', {
          records: records.slice(i, i + BATCH),
          appToken: appToken.trim(),
          tableID: tableID.trim(),
        });
    }
  };

  const handleExport = async (): Promise<void> => {
    if (format === 'bitable' && (!appToken.trim() || !tableID.trim())) {
      toast.error('请填写飞书多维表格的 AppToken 和 TableID');
      return;
    }
    setExporting(true);
    try {
      if (format === 'xlsx') {
        await exportXlsx();
      } else if (format === 'bitable') {
        const response = await axiosForBackend({
          url: '/api/food-entries/export?format=json',
          method: 'GET',
        });
        const data = response.data;
        const entries: FoodEntry[] =
          typeof data === 'string' ? JSON.parse(data) : data;
        if (entries.length === 0) {
          toast.error('没有可导出的数据');
          return;
        }
        await exportBitable(entries);
        toast.success(`成功导出 ${entries.length} 条记录到飞书多维表格`);
      } else {
        downloadViaBackend(format);
        toast.success('导出已开始');
      }
    } catch (error) {
      logger.error('导出失败', error);
      toast.error('导出失败，请确认 AppToken 和 TableID 正确，且表格列名包含：菜名/餐厅/地址/纬度/经度/评分/备注/用餐日期/收藏/标签');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label>导出格式</Label>
        <RadioGroup
          value={format}
          onValueChange={(v: string) => setFormat(v as ExportFormat)}
          className="grid grid-cols-4 gap-3"
        >
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.value}>
                <RadioGroupItem
                  value={opt.value}
                  id={`export-${opt.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`export-${opt.value}`}
                  className={cn(
                    'flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-colors',
                    'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5',
                    'hover:bg-accent/50',
                  )}
                >
                  <Icon className="size-6 text-primary" />
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {opt.desc}
                  </span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {format === 'bitable' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="export-app-token">AppToken</Label>
            <Input
              id="export-app-token"
              value={appToken}
              onChange={(e) => setAppToken(e.target.value)}
              placeholder="从地址栏复制 /base/ 后面的那串字符，如 Ba1sCdefgHiJklMn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-table-id">TableID</Label>
            <Input
              id="export-table-id"
              value={tableID}
              onChange={(e) => setTableID(e.target.value)}
              placeholder="从地址栏复制 ?table= 后面的那串字符，以 tbl 开头"
            />
          </div>
        </div>
      )}

      <Alert>
        <CheckCircle2 className="size-4" />
        <AlertTitle>说明</AlertTitle>
        <AlertDescription>
          {format === 'bitable'
            ? '导出全部美食记录到飞书多维表格。目标表格需包含以下列：菜名、餐厅、地址、纬度、经度、评分、备注、用餐日期、收藏、标签。'
            : '导出全部美食记录，包含菜品、餐厅、地址、经纬度、评分、备注、用餐日期、标签等信息。Excel / CSV 可用表格软件打开，导出的文件也可再次导入。'}
        </AlertDescription>
      </Alert>

      <Button onClick={handleExport} className="w-full" disabled={exporting}>
        <Download className="size-4" />
        {exporting ? '导出中...' : '导出数据'}
      </Button>
    </div>
  );
}

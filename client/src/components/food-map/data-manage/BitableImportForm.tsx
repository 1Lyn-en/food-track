import { useState } from 'react';
import { Table2 } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ImportFoodEntryItem } from '@shared/api.interface';
import { bitableRecordToImportItem } from './bitable-utils';

interface BitableImportFormProps {
  onEntriesLoaded: (entries: ImportFoodEntryItem[]) => void;
}

export function BitableImportForm({ onEntriesLoaded }: BitableImportFormProps) {
  const [appToken, setAppToken] = useState('');
  const [tableID, setTableID] = useState('');
  const [fetching, setFetching] = useState(false);

  const fetchBitableRecords = async (): Promise<void> => {
    if (!appToken.trim() || !tableID.trim()) {
      toast.error('请填写飞书多维表格的 AppToken 和 TableID');
      return;
    }
    setFetching(true);
    try {
      const allRecords: ImportFoodEntryItem[] = [];
      let pageToken: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const result = await capabilityClient
          .load('food_trace_bitable_import_export_1')
          .call<{
            records: Array<{ id: string; record: Record<string, unknown> }>;
            hasMore: boolean;
            pageToken?: string;
          }>('searchRecords', {
            pageSize: 500,
            pageToken,
            appToken: appToken.trim(),
            tableID: tableID.trim(),
          });

        for (const item of result.records) {
          const entry = bitableRecordToImportItem(item.record);
          if (entry) allRecords.push(entry);
        }
        hasMore = result.hasMore;
        pageToken = result.pageToken;
      }

      if (allRecords.length === 0) {
        toast.error('未找到有效的美食记录（需至少包含菜名和餐厅列）');
        return;
      }
      onEntriesLoaded(allRecords);
      toast.success(`获取成功，共 ${allRecords.length} 条记录`);
    } catch (error) {
      logger.error('从飞书多维表格获取数据失败', error);
      toast.error(
        '获取失败，请确认 AppToken 和 TableID 正确，且表格包含：菜名/餐厅/地址/纬度/经度/评分/备注/用餐日期/收藏/标签列',
      );
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Label htmlFor="import-app-token">AppToken</Label>
        <Input
          id="import-app-token"
          value={appToken}
          onChange={(e) => setAppToken(e.target.value)}
              placeholder="从地址栏复制 /base/ 后面的那串字符，如 Ba1sCdefgHiJklMn"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="import-table-id">TableID</Label>
        <Input
          id="import-table-id"
          value={tableID}
          onChange={(e) => setTableID(e.target.value)}
              placeholder="从地址栏复制 ?table= 后面的那串字符，以 tbl 开头"
        />
      </div>
      <Button
        onClick={fetchBitableRecords}
        className="w-full"
        disabled={fetching}
      >
        <Table2 className="size-4" />
        {fetching ? '获取中...' : '获取数据'}
      </Button>
      <p className="text-xs text-muted-foreground">
        目标表格需包含以下列：菜名、餐厅、地址、纬度、经度、评分、备注、用餐日期、收藏、标签
      </p>
    </div>
  );
}
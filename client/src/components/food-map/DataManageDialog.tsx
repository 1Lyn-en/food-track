import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { useFoodMapStore } from '@/store/food-map-store';

import { ExportTab } from './data-manage/ExportTab';
import { ImportTab } from './data-manage/ImportTab';
import { BatchDeleteTab } from './data-manage/BatchDeleteTab';
import { ClearTab } from './data-manage/ClearTab';

interface DataManageDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DataManageDialog({ open, onClose }: DataManageDialogProps) {
  const { dataManageTab, setDataManageTab } = useFoodMapStore();

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto no-scrollbar sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>数据管理</DialogTitle>
          <DialogDescription>
            导出、导入、批量删除或清空你的美食记录数据
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={dataManageTab}
          onValueChange={setDataManageTab}
          className="flex-1"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="export">导出</TabsTrigger>
            <TabsTrigger value="import">导入</TabsTrigger>
            <TabsTrigger value="batch-delete">批量删除</TabsTrigger>
            <TabsTrigger value="clear">清空</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="pt-2">
            <ExportTab />
          </TabsContent>
          <TabsContent value="import" className="pt-2">
            <ImportTab />
          </TabsContent>
          <TabsContent value="batch-delete" className="pt-2">
            <BatchDeleteTab />
          </TabsContent>
          <TabsContent value="clear" className="pt-2">
            <ClearTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

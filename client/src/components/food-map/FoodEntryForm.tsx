import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  FoodEntryFormFields,
  foodEntrySchema,
  type FoodEntryFormValues,
} from '@/components/food-map/FoodEntryFormFields';
import { useFoodEntryDraft } from '@/hooks/use-food-entry-draft';
import type {
  FoodEntry,
  CreateFoodEntryRequest,
} from '@shared/api.interface';

interface FoodEntryFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: FoodEntry | null;
  onSubmit: (data: CreateFoodEntryRequest) => Promise<void>;
}

const defaultValues: FoodEntryFormValues = {
  dishName: '',
  restaurantName: '',
  address: '',
  latitude: 0,
  longitude: 0,
  rating: 3,
  note: '',
  images: [],
  visitDate: format(new Date(), 'yyyy-MM-dd'),
  favorite: false,
  tagIds: [],
  groupId: null,
};

export function FoodEntryForm({
  open,
  onClose,
  initialData,
  onSubmit,
}: FoodEntryFormProps) {
  const { draft, saveDraft, clearDraft } = useFoodEntryDraft();
  const hasInitializedRef = useRef(false);

  const form = useForm<FoodEntryFormValues>({
    resolver: zodResolver(foodEntrySchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false;
      return;
    }
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (initialData) {
      form.reset({
        dishName: initialData.dishName,
        restaurantName: initialData.restaurantName,
        address: initialData.address,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        rating: initialData.rating,
        note: initialData.note ?? '',
        images: initialData.images ?? [],
        visitDate: initialData.visitDate.slice(0, 10),
        favorite: initialData.favorite,
        tagIds: initialData.tags.map((t) => t.id),
        groupId: initialData.groupId,
      });
    } else if (draft && Object.keys(draft).length > 0) {
      form.reset({ ...defaultValues, ...draft } as FoodEntryFormValues);
    } else {
      form.reset(defaultValues);
    }
  }, [open, initialData, draft, form]);

  useEffect(() => {
    if (!open || initialData) return;
    const subscription = form.watch((value) => {
      saveDraft(value as Partial<CreateFoodEntryRequest>);
    });
    return () => subscription.unsubscribe();
  }, [open, initialData, form, saveDraft]);

  const handleCancel = () => {
    clearDraft();
    onClose();
  };

  const handleSubmit = async (values: FoodEntryFormValues) => {
    try {
      await onSubmit(values as CreateFoodEntryRequest);
      clearDraft();
      onClose();
    } catch (error) {
      logger.error('提交美食记录失败', error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto pop-scrollbar rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000]">
        <DialogHeader>
          <DialogTitle className="pop-font text-2xl font-black uppercase tracking-tight">
            {initialData ? '编辑美食记录' : '新建美食记录'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            填写美食记录信息
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FoodEntryFormFields form={form} />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-xl border-4 border-black bg-white font-black uppercase text-black shadow-[4px_4px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl border-4 border-black bg-[#4CD964] font-black uppercase text-black shadow-[4px_4px_0_0_#000] transition-colors hover:bg-[#4CD964] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
              >
                {isSubmitting
                  ? '保存中...'
                  : initialData
                    ? '保存修改'
                    : '创建记录'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

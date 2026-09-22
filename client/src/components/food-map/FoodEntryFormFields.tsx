import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from '@/components/food-map/TagSelector';
import { ImageUrlEditor } from '@/components/food-map/ImageUrlEditor';
import {
  AddressAutoComplete,
  type AddressSuggestion,
} from '@/components/food-map/AddressAutoComplete';
import {
  MapPickerDialog,
  type PickedLocation,
} from '@/components/food-map/MapPickerDialog';
import { Star, Calendar as CalendarIcon, MapPinned, Users, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCollabGroups } from '@client/src/api/collab';
import type { UseFormReturn } from 'react-hook-form';
import { foodEntrySchema, type FoodEntryFormValues } from './food-entry-form-schema';

export { foodEntrySchema, type FoodEntryFormValues };

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`${i + 1} 星`}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                filled
                  ? 'fill-[#FFDE00] text-black'
                  : 'text-black/30 hover:text-black/60',
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-black uppercase text-black">{value} / 5</span>
    </div>
  );
}

function VisitDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start rounded-xl border-4 border-black bg-white pl-3 text-left font-bold uppercase text-black shadow-[4px_4px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            value
          ) : (
            <span className="text-muted-foreground">选择日期</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => {
            if (date) onChange(format(date, 'yyyy-MM-dd'));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface FoodEntryFormFieldsProps {
  form: UseFormReturn<FoodEntryFormValues>;
}

export function FoodEntryFormFields({ form }: FoodEntryFormFieldsProps) {
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const { data: groups = [] } = useCollabGroups();

  const groupId = form.watch('groupId');
  const isShared = groupId !== null && groupId !== undefined;

  const currentLng = Number(form.watch('longitude')) || 0;
  const currentLat = Number(form.watch('latitude')) || 0;
  const hasCoords = currentLng !== 0 && currentLat !== 0;

  const applyLocation = (lng: number, lat: number): void => {
    form.setValue('longitude', Number(lng.toFixed(6)), {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue('latitude', Number(lat.toFixed(6)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleAddressSelect = (suggestion: AddressSuggestion): void => {
    if (suggestion.longitude !== null && suggestion.latitude !== null) {
      applyLocation(suggestion.longitude, suggestion.latitude);
    }
  };

  const handleMapConfirm = (location: PickedLocation): void => {
    applyLocation(location.longitude, location.latitude);
    if (location.address) {
      form.setValue('address', location.address, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dishName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-black uppercase tracking-widest text-xs">菜名 *</FormLabel>
              <FormControl>
                <Input placeholder="如：红烧肉" className="rounded-xl border-4 border-black font-bold focus-visible:ring-0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="restaurantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-black uppercase tracking-widest text-xs">店名 *</FormLabel>
              <FormControl>
                <Input placeholder="如：老北京饭店" className="rounded-xl border-4 border-black font-bold focus-visible:ring-0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black uppercase tracking-widest text-xs">地址</FormLabel>
            <FormControl>
              <AddressAutoComplete
                value={field.value}
                onChange={field.onChange}
                onSelect={handleAddressSelect}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest">
            经纬度
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMapPickerOpen(true)}
            className="h-8 gap-1.5 rounded-xl border-4 border-black bg-[#007AFF] px-3 font-black uppercase tracking-widest text-white shadow-[3px_3px_0_0_#000] hover:bg-[#007AFF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
          >
            <MapPinned className="h-4 w-4" />
            地图选址
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black uppercase tracking-widest text-xs">纬度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="39.9042"
                    className="rounded-xl border-4 border-black font-bold focus-visible:ring-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black uppercase tracking-widest text-xs">经度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="116.4074"
                    className="rounded-xl border-4 border-black font-bold focus-visible:ring-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black uppercase tracking-widest text-xs">评分</FormLabel>
            <FormControl>
              <RatingInput value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tagIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black uppercase tracking-widest text-xs">标签</FormLabel>
            <FormControl>
              <TagSelector
                value={field.value}
                onChange={field.onChange}
                placeholder="选择或创建标签"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visitDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="font-black uppercase tracking-widest text-xs">用餐日期 *</FormLabel>
            <FormControl>
              <VisitDatePicker
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black uppercase tracking-widest text-xs">备注</FormLabel>
            <FormControl>
              <Textarea
                placeholder="记录一下用餐体验..."
                rows={3}
                className="rounded-xl border-4 border-black font-bold focus-visible:ring-0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {groups.length > 0 && (() => {
        const selectedGroup = groups.find((g) => g.id === groupId);
        const hasMultipleGroups = groups.length > 1;

        return (
          <div className="space-y-3 rounded-2xl border-4 border-black bg-[#FFF9C4] p-4">
            <span className="text-xs font-black uppercase tracking-widest text-black">
              可见性
            </span>

            <button
              type="button"
              onClick={() => form.setValue('groupId', null, { shouldDirty: true })}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border-4 border-black px-4 py-3 text-left transition-all',
                !isShared
                  ? 'bg-[#007AFF] text-white shadow-[3px_3px_0_0_#000]'
                  : 'bg-white text-black hover:bg-[#FFDE00]',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  !isShared ? 'border-white' : 'border-black',
                )}
              >
                {!isShared && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-widest">
                  仅自己可见
                </span>
                <span
                  className={cn(
                    'text-xs font-bold',
                    !isShared ? 'text-white/80' : 'text-black/50',
                  )}
                >
                  只有你能看到这条记录
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetId = selectedGroup?.id || groups[0]?.id;
                if (targetId) {
                  form.setValue('groupId', targetId, { shouldDirty: true });
                }
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border-4 border-black px-4 py-3 text-left transition-all',
                isShared
                  ? 'bg-[#007AFF] text-white shadow-[3px_3px_0_0_#000]'
                  : 'bg-white text-black hover:bg-[#FFDE00]',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  isShared ? 'border-white' : 'border-black',
                )}
              >
                {isShared && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </span>
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-sm font-black uppercase tracking-widest">
                  <Users className="h-4 w-4" />
                  共享到「{selectedGroup?.name || groups[0]?.name}」
                </span>
                <span
                  className={cn(
                    'text-xs font-bold',
                    isShared ? 'text-white/80' : 'text-black/50',
                  )}
                >
                  房间内所有人都能看到
                </span>
              </div>
            </button>

            {isShared && hasMultipleGroups && (
              <Select
                value={groupId || ''}
                onValueChange={(v) => form.setValue('groupId', v, { shouldDirty: true })}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-4 border-black bg-white text-sm font-bold focus:ring-0">
                  <SelectValue placeholder="切换房间" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-4 border-black">
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id} className="font-bold">
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })()}

      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black uppercase tracking-widest text-xs">图片</FormLabel>
            <FormControl>
              <ImageUrlEditor
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <MapPickerDialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        initialCenter={hasCoords ? [currentLng, currentLat] : null}
        onConfirm={handleMapConfirm}
      />
    </>
  );
}

import { z } from 'zod';

export const foodEntrySchema = z.object({
  dishName: z.string().min(1, '请输入菜名'),
  restaurantName: z.string().min(1, '请输入店名'),
  address: z.string().default(''),
  latitude: z.coerce.number().default(0),
  longitude: z.coerce.number().default(0),
  rating: z.number().min(1).max(5).default(3),
  note: z.string().default(''),
  images: z.array(z.string().min(1)).default([]),
  visitDate: z.string().min(1, '请选择用餐日期'),
  favorite: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
  groupId: z.string().nullable().default(null),
});

export type FoodEntryFormValues = z.infer<typeof foodEntrySchema>;

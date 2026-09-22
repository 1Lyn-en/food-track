import type { ImportFoodEntryItem } from '@shared/api.interface';

export function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseTagNames(value: unknown): string[] {
  if (!value) return [];
  return String(value)
    .split(/[/、,，|]/)
    .map((s: string) => s.trim())
    .filter(Boolean);
}

export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return ['1', 'true', 'yes', 'y', '是'].includes(normalized);
}

export function getBitableFieldValue(
  record: Record<string, unknown>,
  fieldName: string,
): unknown {
  const val = record[fieldName];
  if (val && typeof val === 'object' && 'text' in val) {
    return (val as { text: unknown }).text;
  }
  return val;
}

export function bitableRecordToImportItem(
  record: Record<string, unknown>,
): ImportFoodEntryItem | null {
  const dishName = String(getBitableFieldValue(record, '菜名') ?? '').trim();
  const restaurantName = String(
    getBitableFieldValue(record, '餐厅') ?? '',
  ).trim();
  if (!dishName || !restaurantName) return null;

  const visitDateRaw = getBitableFieldValue(record, '用餐日期');
  const visitDate =
    typeof visitDateRaw === 'number'
      ? new Date(visitDateRaw).toISOString()
      : String(visitDateRaw ?? '').trim() || new Date().toISOString();

  return {
    dishName,
    restaurantName,
    address: String(getBitableFieldValue(record, '地址') ?? '').trim(),
    latitude: toNumber(getBitableFieldValue(record, '纬度')),
    longitude: toNumber(getBitableFieldValue(record, '经度')),
    rating: Math.min(
      5,
      Math.max(1, toNumber(getBitableFieldValue(record, '评分'), 5)),
    ),
    note: String(getBitableFieldValue(record, '备注') ?? ''),
    visitDate,
    favorite: toBoolean(getBitableFieldValue(record, '收藏')),
    tagNames: parseTagNames(getBitableFieldValue(record, '标签')),
  };
}

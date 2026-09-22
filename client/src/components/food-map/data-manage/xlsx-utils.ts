import type { FoodEntry, ImportFoodEntryItem } from '@shared/api.interface';

export const XLSX_HEADERS = [
  '菜名',
  '店名',
  '地址',
  '纬度',
  '经度',
  '评分',
  '备注',
  '用餐日期',
  '标签',
  '收藏',
] as const;

type ExportedEntry = Pick<
  FoodEntry,
  | 'dishName'
  | 'restaurantName'
  | 'address'
  | 'latitude'
  | 'longitude'
  | 'rating'
  | 'note'
  | 'visitDate'
  | 'favorite'
> & { tags?: Array<{ name: string }> };

type SheetRow = Record<string, unknown>;

function entryToRow(item: ExportedEntry): SheetRow {
  return {
    菜名: item.dishName ?? '',
    店名: item.restaurantName ?? '',
    地址: item.address ?? '',
    纬度: item.latitude ?? 0,
    经度: item.longitude ?? 0,
    评分: item.rating ?? 0,
    备注: item.note ?? '',
    用餐日期: item.visitDate ?? '',
    标签: (item.tags ?? []).map((t) => t.name).join('/'),
    收藏: item.favorite ? '是' : '否',
  };
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseTagNames(value: unknown): string[] {
  if (!value) return [];
  return String(value)
    .split(/[/、,，|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function rowToImportItem(row: SheetRow): ImportFoodEntryItem | null {
  const dishName = String(row['菜名'] ?? '').trim();
  const restaurantName = String(row['店名'] ?? '').trim();
  if (!dishName || !restaurantName) return null;

  const favoriteRaw = String(row['收藏'] ?? '').trim();
  return {
    dishName,
    restaurantName,
    address: String(row['地址'] ?? '').trim(),
    latitude: toNumber(row['纬度']),
    longitude: toNumber(row['经度']),
    rating: Math.min(5, Math.max(1, toNumber(row['评分'], 5))),
    note: String(row['备注'] ?? ''),
    visitDate: String(row['用餐日期'] ?? '').trim() || new Date().toISOString(),
    favorite:
      favoriteRaw === '是' || favoriteRaw === 'true' || favoriteRaw === '1',
    tagNames: parseTagNames(row['标签']),
  };
}

export async function exportEntriesToXlsx(
  entries: ExportedEntry[],
  filename: string,
): Promise<void> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('美食记录');
  const widths = [18, 18, 28, 10, 10, 6, 24, 22, 18, 6];

  worksheet.columns = XLSX_HEADERS.map((header, index) => ({
    header,
    key: header,
    width: widths[index],
  }));
  worksheet.addRows(entries.map(entryToRow));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeCellValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (!value || typeof value !== 'object') return value ?? '';

  const record = value as Record<string, unknown>;
  if ('result' in record) return record.result ?? '';
  if ('text' in record) return record.text ?? '';
  if (Array.isArray(record.richText)) {
    return record.richText
      .map((part) =>
        typeof part === 'object' && part && 'text' in part
          ? String(part.text)
          : '',
      )
      .join('');
  }
  return '';
}

export async function parseXlsxFile(
  buffer: ArrayBuffer,
): Promise<ImportFoodEntryItem[]> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const columnByHeader = new Map<string, number>();
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    columnByHeader.set(
      String(normalizeCellValue(cell.value)).trim(),
      columnNumber,
    );
  });

  const rows: SheetRow[] = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const value: SheetRow = {};
    for (const header of XLSX_HEADERS) {
      const columnNumber = columnByHeader.get(header);
      value[header] = columnNumber
        ? normalizeCellValue(row.getCell(columnNumber).value)
        : '';
    }
    rows.push(value);
  }

  return rows
    .map(rowToImportItem)
    .filter((item): item is ImportFoodEntryItem => item !== null);
}

export function parseJsonEntries(text: string): ImportFoodEntryItem[] {
  const data = JSON.parse(text);
  const rawList: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.entries)
      ? data.entries
      : [];

  return rawList
    .map((raw): ImportFoodEntryItem | null => {
      if (!raw || typeof raw !== 'object') return null;
      const obj = raw as Record<string, unknown>;
      const dishName = String(obj.dishName ?? '').trim();
      const restaurantName = String(obj.restaurantName ?? '').trim();
      if (!dishName || !restaurantName) return null;

      const tagNames: string[] = Array.isArray(obj.tagNames)
        ? (obj.tagNames as unknown[])
            .map((n) => String(n).trim())
            .filter(Boolean)
        : Array.isArray(obj.tags)
          ? (obj.tags as unknown[])
              .map((t) =>
                typeof t === 'string'
                  ? t.trim()
                  : String((t as Record<string, unknown>)?.name ?? '').trim(),
              )
              .filter(Boolean)
          : [];

      return {
        dishName,
        restaurantName,
        address: String(obj.address ?? '').trim(),
        latitude: toNumber(obj.latitude),
        longitude: toNumber(obj.longitude),
        rating: Math.min(5, Math.max(1, toNumber(obj.rating, 5))),
        note: String(obj.note ?? ''),
        visitDate:
          String(obj.visitDate ?? '').trim() || new Date().toISOString(),
        favorite: Boolean(obj.favorite),
        images: Array.isArray(obj.images)
          ? (obj.images as unknown[]).map((i) => String(i))
          : [],
        tagNames,
      };
    })
    .filter((item): item is ImportFoodEntryItem => item !== null);
}

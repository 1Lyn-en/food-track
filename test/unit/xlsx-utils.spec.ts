import * as ExcelJS from 'exceljs';

import {
  XLSX_HEADERS,
  parseJsonEntries,
  parseXlsxFile,
} from '../../client/src/components/food-map/data-manage/xlsx-utils';

describe('data import parsing', () => {
  it('parses an in-memory XLSX workbook', async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('美食记录');
    worksheet.addRow([...XLSX_HEADERS]);
    worksheet.addRow([
      '牛肉面',
      '老街面馆',
      '中山路 1 号',
      31.23,
      121.47,
      5,
      '清汤',
      '2026-09-21',
      '面食/收藏',
      '是',
    ]);

    const buffer = await workbook.xlsx.writeBuffer();
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;

    await expect(parseXlsxFile(arrayBuffer)).resolves.toEqual([
      expect.objectContaining({
        dishName: '牛肉面',
        restaurantName: '老街面馆',
        rating: 5,
        favorite: true,
        tagNames: ['面食', '收藏'],
      }),
    ]);
  });

  it('rejects incomplete JSON records', () => {
    expect(
      parseJsonEntries(
        JSON.stringify([
          { dishName: '牛肉面', restaurantName: '老街面馆' },
          { dishName: '', restaurantName: '无效记录' },
        ]),
      ),
    ).toHaveLength(1);
  });
});

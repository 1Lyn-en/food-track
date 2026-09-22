import {
  bitableRecordToImportItem,
  getBitableFieldValue,
  parseTagNames,
  toBoolean,
  toNumber,
} from '../../client/src/components/food-map/data-manage/bitable-utils';

describe('bitable import utilities', () => {
  it('normalizes primitive field values', () => {
    expect(toNumber('31.23')).toBe(31.23);
    expect(toNumber('invalid', 5)).toBe(5);
    expect(toBoolean('是')).toBe(true);
    expect(toBoolean('否')).toBe(false);
    expect(toBoolean(0)).toBe(false);
  });

  it('extracts text fields and splits tag delimiters', () => {
    const record = { 菜名: { text: '牛肉面' } };

    expect(getBitableFieldValue(record, '菜名')).toBe('牛肉面');
    expect(parseTagNames('面食/收藏，夜宵')).toEqual([
      '面食',
      '收藏',
      '夜宵',
    ]);
  });

  it('clamps rating and rejects incomplete records', () => {
    expect(
      bitableRecordToImportItem({
        菜名: '牛肉面',
        餐厅: '老街面馆',
        评分: 9,
        收藏: '否',
      }),
    ).toEqual(
      expect.objectContaining({
        dishName: '牛肉面',
        restaurantName: '老街面馆',
        rating: 5,
        favorite: false,
      }),
    );
    expect(bitableRecordToImportItem({ 菜名: '牛肉面' })).toBeNull();
  });
});

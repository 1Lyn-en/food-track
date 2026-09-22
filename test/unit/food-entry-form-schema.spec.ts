import { foodEntrySchema } from '../../client/src/components/food-map/food-entry-form-schema';

describe('food entry form schema', () => {
  const validEntry = {
    dishName: '牛肉面',
    restaurantName: '老街面馆',
    address: '中山路 1 号',
    latitude: '31.23',
    longitude: '121.47',
    rating: 5,
    note: '',
    images: [],
    visitDate: '2026-09-22',
    favorite: false,
    tagIds: [],
    groupId: null,
  };

  it('coerces coordinates and accepts a complete entry', () => {
    const parsed = foodEntrySchema.parse(validEntry);

    expect(parsed.latitude).toBe(31.23);
    expect(parsed.longitude).toBe(121.47);
  });

  it.each([
    [{ ...validEntry, dishName: '' }, 'dishName'],
    [{ ...validEntry, restaurantName: '' }, 'restaurantName'],
    [{ ...validEntry, rating: 0 }, 'rating'],
    [{ ...validEntry, rating: 6 }, 'rating'],
  ])('rejects invalid input for %s', (input, expectedPath) => {
    const result = foodEntrySchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain(expectedPath);
    }
  });
});

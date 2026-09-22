import { ForbiddenException } from '@nestjs/common';

import type { CreateFoodEntryRequest } from '@shared/api.interface';
import { FoodEntryService } from './food-entry.service';

function createSelectMock(result: unknown[]) {
  const limit = jest.fn().mockResolvedValue(result);
  const where = jest.fn(() => ({ limit }));
  const from = jest.fn(() => ({ where }));
  return { select: jest.fn(() => ({ from })) };
}

const entry: CreateFoodEntryRequest = {
  dishName: '牛肉面',
  restaurantName: '老街面馆',
  address: '中山路 1 号',
  latitude: 31.23,
  longitude: 121.47,
  rating: 5,
  note: '',
  images: [],
  visitDate: '2026-09-22',
  favorite: false,
  tagIds: [],
  groupId: 'group-1',
};

describe('FoodEntryService group access', () => {
  it('rejects creating a shared entry outside the current user groups', async () => {
    const db = {
      ...createSelectMock([]),
      insert: jest.fn(),
    };
    const service = new FoodEntryService(db as never);

    await expect(service.create(entry, 'user-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('creates a personal entry without a group membership query', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'entry-1' }]);
    const values = jest.fn(() => ({ returning }));
    const db = {
      select: jest.fn(),
      insert: jest.fn(() => ({ values })),
    };
    const service = new FoodEntryService(db as never);

    await expect(
      service.create({ ...entry, groupId: null }, 'user-1'),
    ).resolves.toEqual({ id: 'entry-1' });
    expect(db.select).not.toHaveBeenCalled();
  });
});

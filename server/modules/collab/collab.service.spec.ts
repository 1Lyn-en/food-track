import { NotFoundException } from '@nestjs/common';

import { CollabService } from './collab.service';

describe('CollabService group access', () => {
  it('does not expose group details to non-members', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn(() => ({ limit }));
    const from = jest.fn(() => ({ where }));
    const db = {
      select: jest.fn(() => ({ from })),
    };
    const service = new CollabService(db as never, {} as never);

    await expect(
      service.getGroupDetail('group-1', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(db.select).toHaveBeenCalledTimes(1);
  });
});

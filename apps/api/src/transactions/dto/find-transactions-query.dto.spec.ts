import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindTransactionsQueryDto } from './find-transactions-query.dto';

describe('FindTransactionsQueryDto', () => {
  it('defaults to page 1 and limit 10 when not provided', async () => {
    const dto = plainToInstance(FindTransactionsQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('accepts a limit equal to the maximum allowed (50)', async () => {
    const dto = plainToInstance(FindTransactionsQueryDto, { limit: '50' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.limit).toBe(50);
  });

  it('rejects a limit greater than the maximum allowed (50)', async () => {
    const dto = plainToInstance(FindTransactionsQueryDto, { limit: '51' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('limit');
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('rejects a page lower than 1', async () => {
    const dto = plainToInstance(FindTransactionsQueryDto, { page: '0' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('page');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('rejects a non ISO 8601 startDate', async () => {
    const dto = plainToInstance(FindTransactionsQueryDto, {
      startDate: 'not-a-date',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('startDate');
  });
});

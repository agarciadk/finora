import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetAnalyticsQueryDto } from './get-analytics-query.dto';

describe('GetAnalyticsQueryDto', () => {
  it('allows omitting both month and year', async () => {
    const dto = plainToInstance(GetAnalyticsQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.month).toBeUndefined();
    expect(dto.year).toBeUndefined();
  });

  it('accepts a valid month and year', async () => {
    const dto = plainToInstance(GetAnalyticsQueryDto, {
      month: '3',
      year: '2026',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.month).toBe(3);
    expect(dto.year).toBe(2026);
  });

  it('rejects a month outside the 1-12 range', async () => {
    const dto = plainToInstance(GetAnalyticsQueryDto, { month: '13' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('month');
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('rejects a year outside the accepted range', async () => {
    const dto = plainToInstance(GetAnalyticsQueryDto, { year: '1999' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('year');
    expect(errors[0].constraints).toHaveProperty('min');
  });
});

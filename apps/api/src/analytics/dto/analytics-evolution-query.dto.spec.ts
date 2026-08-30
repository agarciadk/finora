import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AnalyticsEvolutionQueryDto } from './analytics-evolution-query.dto';

describe('AnalyticsEvolutionQueryDto', () => {
  it('defaults months to 6 when not provided', async () => {
    const dto = plainToInstance(AnalyticsEvolutionQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.months).toBe(6);
  });

  it('accepts months equal to the maximum allowed (12)', async () => {
    const dto = plainToInstance(AnalyticsEvolutionQueryDto, { months: '12' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.months).toBe(12);
  });

  it('rejects months greater than the maximum allowed (12)', async () => {
    const dto = plainToInstance(AnalyticsEvolutionQueryDto, { months: '13' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('months');
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('rejects months lower than 1', async () => {
    const dto = plainToInstance(AnalyticsEvolutionQueryDto, { months: '0' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('months');
    expect(errors[0].constraints).toHaveProperty('min');
  });
});

import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';
import { CATEGORY_COLORS } from '../category-colors';

describe('CreateCategoryDto', () => {
  it('allows omitting color', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: 'Alimentación',
      type: 'EXPENSE',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.color).toBeUndefined();
  });

  it('accepts a color from the fixed palette', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: 'Alimentación',
      type: 'EXPENSE',
      color: CATEGORY_COLORS[0],
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.color).toBe(CATEGORY_COLORS[0]);
  });

  it('rejects a color outside the fixed palette', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: 'Alimentación',
      type: 'EXPENSE',
      color: '#000000',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('color');
    expect(errors[0].constraints).toHaveProperty('isIn');
  });
});

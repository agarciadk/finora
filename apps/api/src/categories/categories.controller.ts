import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated user's categories" })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @AuditLog('CATEGORY')
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @AuditLog('CATEGORY')
  @ApiOperation({ summary: 'Rename a category or change its type' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @AuditLog('CATEGORY')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a category, safely reassigning its data to "Otros"',
    description:
      'Runs inside a single Prisma transaction: finds or creates a fallback category named "Otros" matching the deleted category\'s type, reassigns every transaction and budget currently pointing to the deleted category to it, then soft-deletes the requested category.',
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import { ImportService } from './import.service';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import {
  ALLOWED_IMPORT_EXTENSIONS,
  MAX_IMPORT_FILE_SIZE_BYTES,
} from './import.constants';

@ApiTags('Import')
@Controller('accounts/:accountId/import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('preview')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMPORT_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!ALLOWED_IMPORT_EXTENSIONS.includes(extension)) {
          callback(
            new BadRequestException(
              'Formato de archivo no soportado. Solo se admiten CSV y XLSX.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  preview(
    @Param('accountId') accountId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.importService.preview(accountId, file);
  }

  @Post('confirm')
  confirm(
    @Param('accountId') accountId: string,
    @Body() dto: ConfirmImportDto,
  ) {
    return this.importService.confirm(accountId, dto);
  }
}

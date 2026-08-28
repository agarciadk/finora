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
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import { ImportService } from './import.service';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import {
  ALLOWED_IMPORT_EXTENSIONS,
  ALLOWED_IMPORT_MIME_TYPES,
  MAX_IMPORT_FILE_SIZE_BYTES,
} from './import.constants';

@ApiTags('Import')
@Controller('accounts/:accountId/import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('preview')
  @ApiOperation({
    summary:
      'Parse an uploaded CSV/XLSX/XLS file and preview the transactions it contains',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMPORT_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        // Mime type is a soft, secondary check: browsers report inconsistent
        // values for legacy `.xls` files (some send `application/octet-stream`),
        // so the extension plus each importer's magic-byte check are the
        // real gate against spoofed content.
        const hasValidMimeType =
          ALLOWED_IMPORT_MIME_TYPES.includes(file.mimetype) ||
          file.mimetype === 'application/octet-stream';

        if (
          !ALLOWED_IMPORT_EXTENSIONS.includes(extension) ||
          !hasValidMimeType
        ) {
          callback(
            new BadRequestException(
              'Formato de archivo no soportado. Solo se admiten CSV, XLSX y XLS.',
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

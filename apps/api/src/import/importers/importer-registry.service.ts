import {
  Inject,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { TRANSACTION_IMPORTERS } from './transaction-importer.interface';
import type { TransactionImporter } from './transaction-importer.interface';
import type { ImportFile } from '../types/import-file.type';

@Injectable()
export class ImporterRegistryService {
  constructor(
    @Inject(TRANSACTION_IMPORTERS)
    private readonly importers: TransactionImporter[],
  ) {}

  async resolve(file: ImportFile): Promise<TransactionImporter> {
    for (const importer of this.importers) {
      if (await importer.canParse(file)) {
        return importer;
      }
    }

    throw new UnsupportedMediaTypeException(
      'Formato de archivo no soportado. Solo se admiten CSV y XLSX.',
    );
  }
}

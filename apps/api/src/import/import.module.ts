import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../common/current-user/current-user.module';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImporterRegistryService } from './importers/importer-registry.service';
import { CsvTransactionImporter } from './importers/csv-transaction-importer';
import { XlsxTransactionImporter } from './importers/xlsx-transaction-importer';
import { TRANSACTION_IMPORTERS } from './importers/transaction-importer.interface';
import type { TransactionImporter } from './importers/transaction-importer.interface';

@Module({
  imports: [CurrentUserModule],
  controllers: [ImportController],
  providers: [
    ImportService,
    ImporterRegistryService,
    CsvTransactionImporter,
    XlsxTransactionImporter,
    {
      provide: TRANSACTION_IMPORTERS,
      // Order matters: the first importer whose `canParse` returns true
      // wins. Add new bank-specific importers here (before the generic
      // ones) to let them take priority over the generic CSV/XLSX parsing.
      useFactory: (
        csv: CsvTransactionImporter,
        xlsx: XlsxTransactionImporter,
      ): TransactionImporter[] => [csv, xlsx],
      inject: [CsvTransactionImporter, XlsxTransactionImporter],
    },
  ],
})
export class ImportModule {}

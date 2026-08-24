import ExcelJS from 'exceljs';
import { XlsxTransactionImporter } from './xlsx-transaction-importer';
import type { ImportFile } from '../types/import-file.type';

async function buildWorkbookFile(
  build: (workbook: ExcelJS.Workbook) => void,
): Promise<ImportFile> {
  const workbook = new ExcelJS.Workbook();
  build(workbook);
  const buffer = await workbook.xlsx.writeBuffer();
  return {
    originalName: 'movimientos.xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(buffer),
  };
}

describe('XlsxTransactionImporter', () => {
  const importer = new XlsxTransactionImporter();

  describe('canParse', () => {
    it('accepts .xlsx files with a valid zip signature', async () => {
      const file = await buildWorkbookFile((wb) => {
        const sheet = wb.addWorksheet('Movimientos');
        sheet.addRow(['Fecha', 'Concepto', 'Importe']);
      });
      await expect(importer.canParse(file)).resolves.toBe(true);
    });

    it('rejects non-xlsx extensions', async () => {
      const file = await buildWorkbookFile((wb) => wb.addWorksheet('S'));
      file.originalName = 'movimientos.csv';
      await expect(importer.canParse(file)).resolves.toBe(false);
    });

    it('rejects buffers without a zip signature', async () => {
      const file: ImportFile = {
        originalName: 'movimientos.xlsx',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('not a real xlsx file'),
      };
      await expect(importer.canParse(file)).resolves.toBe(false);
    });
  });

  describe('parse', () => {
    it('extracts transactions from a valid sheet', async () => {
      const file = await buildWorkbookFile((wb) => {
        const sheet = wb.addWorksheet('Movimientos');
        sheet.addRow(['Fecha', 'Concepto', 'Importe', 'Saldo']);
        sheet.addRow([new Date(2026, 2, 1), 'Supermercado', -25.5, 974.5]);
        sheet.addRow(['02/03/2026', 'Nomina', 1500, 2474.5]);
      });

      const rows = await importer.parse(file);

      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({
        description: 'Supermercado',
        amount: '-25.50',
        balance: '974.50',
      });
      expect(rows[0].date?.toISOString().slice(0, 10)).toBe('2026-03-01');
      expect(rows[1]).toMatchObject({
        description: 'Nomina',
        amount: '1500.00',
      });
    });

    it('picks the sheet with movements when the workbook has multiple sheets', async () => {
      const file = await buildWorkbookFile((wb) => {
        wb.addWorksheet('Notas').addRow(['Esto no es una tabla']);
        const sheet = wb.addWorksheet('Movimientos');
        sheet.addRow(['Fecha', 'Concepto', 'Importe']);
        sheet.addRow(['01/03/2026', 'Compra', -10]);
        sheet.addRow(['02/03/2026', 'Compra 2', -20]);
      });

      const rows = await importer.parse(file);
      expect(rows).toHaveLength(2);
    });

    it('ignores a sheet with headers but no movement rows', async () => {
      const file = await buildWorkbookFile((wb) => {
        wb.addWorksheet('Vacia').addRow(['Fecha', 'Concepto', 'Importe']);
        const sheet = wb.addWorksheet('Movimientos');
        sheet.addRow(['Fecha', 'Concepto', 'Importe']);
        sheet.addRow(['01/03/2026', 'Compra', -10]);
      });

      const rows = await importer.parse(file);
      expect(rows).toHaveLength(1);
    });

    it('supports amounts in different numeric formats', async () => {
      const file = await buildWorkbookFile((wb) => {
        const sheet = wb.addWorksheet('Movimientos');
        sheet.addRow(['Fecha', 'Concepto', 'Importe']);
        sheet.addRow(['01/03/2026', 'Numero', -25.5]);
        sheet.addRow(['02/03/2026', 'Texto con coma', '1.234,56']);
      });

      const rows = await importer.parse(file);
      expect(rows[0].amount).toBe('-25.50');
      expect(rows[1].amount).toBe('1234.56');
    });

    it('throws when no sheet has recognizable columns', async () => {
      const file = await buildWorkbookFile((wb) => {
        wb.addWorksheet('Notas').addRow(['Columna A', 'Columna B']);
      });

      await expect(importer.parse(file)).rejects.toThrow();
    });
  });
});

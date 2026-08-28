import * as XLSX from 'xlsx';
import { XlsTransactionImporter } from './xls-transaction-importer';
import type { ImportFile } from '../types/import-file.type';

function buildXlsFile(rows: unknown[][]): ImportFile {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');
  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'biff8',
  }) as Buffer;
  return {
    originalName: 'movimientos.xls',
    mimeType: 'application/vnd.ms-excel',
    buffer,
  };
}

describe('XlsTransactionImporter', () => {
  const importer = new XlsTransactionImporter();

  describe('canParse', () => {
    it('accepts .xls files with a valid OLE2 signature', async () => {
      const file = buildXlsFile([['Fecha', 'Concepto', 'Importe']]);
      await expect(importer.canParse(file)).resolves.toBe(true);
    });

    it('rejects non-xls extensions', async () => {
      const file = buildXlsFile([['Fecha', 'Concepto', 'Importe']]);
      file.originalName = 'movimientos.xlsx';
      await expect(importer.canParse(file)).resolves.toBe(false);
    });

    it('rejects buffers without an OLE2 signature', async () => {
      const file: ImportFile = {
        originalName: 'movimientos.xls',
        mimeType: 'application/vnd.ms-excel',
        buffer: Buffer.from('not a real xls file'),
      };
      await expect(importer.canParse(file)).resolves.toBe(false);
    });
  });

  describe('parse', () => {
    it('extracts transactions from a valid sheet', async () => {
      const file = buildXlsFile([
        ['Fecha', 'Concepto', 'Importe', 'Saldo'],
        ['01/03/2026', 'Supermercado', -25.5, 974.5],
        ['02/03/2026', 'Nomina', 1500, 2474.5],
      ]);

      const rows = await importer.parse(file);

      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({
        description: 'Supermercado',
        amount: '-25.50',
        balance: '974.50',
      });
      expect(rows[1]).toMatchObject({
        description: 'Nomina',
        amount: '1500.00',
      });
    });

    it('picks the sheet with movements when the workbook has multiple sheets', async () => {
      const worksheetNotes = XLSX.utils.aoa_to_sheet([
        ['Esto no es una tabla'],
      ]);
      const worksheetMovements = XLSX.utils.aoa_to_sheet([
        ['Fecha', 'Concepto', 'Importe'],
        ['01/03/2026', 'Compra', -10],
        ['02/03/2026', 'Compra 2', -20],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheetNotes, 'Notas');
      XLSX.utils.book_append_sheet(workbook, worksheetMovements, 'Movimientos');
      const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'biff8',
      }) as Buffer;

      const rows = await importer.parse({
        originalName: 'movimientos.xls',
        mimeType: 'application/vnd.ms-excel',
        buffer,
      });

      expect(rows).toHaveLength(2);
    });

    it('throws ImportParsingError when no sheet has recognizable columns', async () => {
      const file = buildXlsFile([['Nota', 'Sin columnas reconocibles']]);
      await expect(importer.parse(file)).rejects.toThrow(
        /No se ha encontrado ninguna hoja/,
      );
    });

    it('supports charge/credit columns instead of a single amount column', async () => {
      const file = buildXlsFile([
        ['Fecha', 'Concepto', 'Cargo', 'Abono'],
        ['01/03/2026', 'Compra', 25.5, null],
        ['02/03/2026', 'Nomina', null, 1500],
      ]);

      const rows = await importer.parse(file);

      expect(rows[0]).toMatchObject({ amount: '-25.50' });
      expect(rows[1]).toMatchObject({ amount: '1500.00' });
    });
  });
});

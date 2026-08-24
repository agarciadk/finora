import { CsvTransactionImporter } from './csv-transaction-importer';
import type { ImportFile } from '../types/import-file.type';

function csvFile(content: string, name = 'movimientos.csv'): ImportFile {
  return {
    originalName: name,
    mimeType: 'text/csv',
    buffer: Buffer.from(content, 'utf-8'),
  };
}

describe('CsvTransactionImporter', () => {
  const importer = new CsvTransactionImporter();

  describe('canParse', () => {
    it('accepts .csv files', async () => {
      const file = csvFile('Fecha,Concepto,Importe\n01/01/2026,Test,10,00\n');
      await expect(importer.canParse(file)).resolves.toBe(true);
    });

    it('rejects non-csv extensions', async () => {
      const file = csvFile('Fecha,Concepto,Importe\n', 'movimientos.xlsx');
      await expect(importer.canParse(file)).resolves.toBe(false);
    });

    it('rejects files that look like a zip (xlsx) despite the .csv name', async () => {
      const file: ImportFile = {
        originalName: 'movimientos.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]),
      };
      await expect(importer.canParse(file)).resolves.toBe(false);
    });
  });

  describe('parse', () => {
    it('parses a comma-delimited file with a single amount column', async () => {
      const file = csvFile(
        'Fecha,Concepto,Importe\n01/03/2026,Supermercado,-25.50\n02/03/2026,Nomina,1500.00\n',
      );
      const rows = await importer.parse(file);

      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({
        description: 'Supermercado',
        amount: '-25.50',
        errors: [],
      });
      expect(rows[1]).toMatchObject({
        description: 'Nomina',
        amount: '1500.00',
        errors: [],
      });
    });

    it('parses a semicolon-delimited file', async () => {
      const file = csvFile(
        'Fecha;Concepto;Importe\n01/03/2026;Supermercado;-25,50\n',
      );
      const rows = await importer.parse(file);

      expect(rows).toHaveLength(1);
      expect(rows[0].amount).toBe('-25.50');
    });

    it('combines cargo/abono columns into a signed amount', async () => {
      const file = csvFile(
        'Fecha;Concepto;Cargo;Abono\n01/03/2026;Compra;25,50;\n02/03/2026;Ingreso;;100,00\n',
      );
      const rows = await importer.parse(file);

      expect(rows[0].amount).toBe('-25.50');
      expect(rows[1].amount).toBe('100.00');
    });

    it('flags rows with invalid dates', async () => {
      const file = csvFile(
        'Fecha,Concepto,Importe\nno-es-una-fecha,Compra,10.00\n',
      );
      const rows = await importer.parse(file);

      expect(rows[0].date).toBeNull();
      expect(rows[0].errors).toContain('Fecha no válida');
    });

    it('flags rows with invalid amounts', async () => {
      const file = csvFile(
        'Fecha,Concepto,Importe\n01/03/2026,Compra,no-es-un-importe\n',
      );
      const rows = await importer.parse(file);

      expect(rows[0].amount).toBeNull();
      expect(rows[0].errors).toContain('Importe no válido');
    });

    it('throws when no recognizable columns are present', async () => {
      const file = csvFile('Columna A,Columna B\nx,y\n');
      await expect(importer.parse(file)).rejects.toThrow();
    });

    it('returns no rows for an empty file', async () => {
      const file = csvFile('');
      const rows = await importer.parse(file);
      expect(rows).toEqual([]);
    });
  });
});

export const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMPORT_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
// Informational only (used for Swagger docs): the real gate is the
// extension check above plus each importer's magic-byte `canParse` check,
// since browsers report inconsistent mime types for legacy `.xls` files.
export const ALLOWED_IMPORT_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

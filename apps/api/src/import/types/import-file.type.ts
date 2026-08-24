// Storage-agnostic representation of an uploaded file: importers never touch
// Multer/Express types directly, so they stay easy to unit test.
export type ImportFile = {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
};

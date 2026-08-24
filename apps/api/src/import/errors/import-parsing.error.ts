// Thrown by importers when a file's structure makes it impossible to
// extract any transactions at all (e.g. no recognizable columns). Row-level
// issues (invalid date/amount in a single row) are NOT reported this way —
// those become per-row errors in the preview instead.
export class ImportParsingError extends Error {}

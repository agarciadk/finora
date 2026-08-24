const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);

// Spanish/European bank exports are frequently saved as Windows-1252/Latin-1
// instead of UTF-8. There is no reliable way to *detect* an encoding, so we
// use a pragmatic heuristic: decode as UTF-8 and fall back to Latin-1 if the
// result contains the replacement character (U+FFFD), which only appears
// when UTF-8 decoding failed.
export function decodeBuffer(buffer: Buffer): string {
  const withoutBom = buffer.subarray(0, UTF8_BOM.length).equals(UTF8_BOM)
    ? buffer.subarray(UTF8_BOM.length)
    : buffer;

  const utf8 = withoutBom.toString('utf-8');
  if (!utf8.includes('\uFFFD')) {
    return utf8;
  }

  return withoutBom.toString('latin1');
}

/**
 * Convert a string in the proto-orthography (with <ý> or <ń>) to a Plains Cree SRO transcription (with <y> only).
 * @param  {String} string The string to transliterate.
 * @return {String}
 */
export default function proto2sro(string) {
  return string
  .normalize()
  .replace(/ń/gu, `y`)  // U+0144
  .replace(/ý/gu, `y`); // U+00FD
}

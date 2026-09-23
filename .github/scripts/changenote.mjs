// The Steam change note is the fenced block under "### <version>" in PUBLICATION.md, so there is
// no second copy that could drift from it.
export function changenoteFor(publication, version) {
  const lines = publication.split(/\r?\n/);
  const heading = new RegExp(`^### +${version.replaceAll('.', '\\.')}(\\s|$)`);
  const start = lines.findIndex((line) => heading.test(line));
  if (start === -1) throw new Error(`PUBLICATION.md has no "### ${version}" section`);
  const open = lines.findIndex((line, i) => i > start && /^```/.test(line));
  const next = lines.findIndex((line, i) => i > start && /^### /.test(line));
  if (open === -1 || (next !== -1 && open > next)) throw new Error(`the "### ${version}" section of PUBLICATION.md has no fenced change note`);
  const close = lines.findIndex((line, i) => i > open && /^```\s*$/.test(line));
  if (close === -1) throw new Error(`the change note of "### ${version}" is not closed`);
  const note = lines.slice(open + 1, close).join('\n').trim();
  if (!note) throw new Error(`the change note of "### ${version}" is empty`);
  return note;
}

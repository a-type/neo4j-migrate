export default (filename: string) => {
  const matches = filename.match(/^(\d+)-/);
  if (!matches) {
    // could probably be smarter about this
    throw new Error(
      `File "${filename}" in the migration directory does not follow naming pattern (###-name.yml)`
    );
  }
  return parseInt(matches[0], 10);
};

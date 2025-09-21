// Fungsi untuk trim semua string di hasil query
export function trimStrings(rows: any[]) {
  return rows.map((row) => {
    const newRow: any = {};
    for (const key in row) {
      if (typeof row[key] === "string") {
        newRow[key] = row[key].trim();
      } else {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimStrings = trimStrings;
// Fungsi untuk trim semua string di hasil query
function trimStrings(rows) {
    return rows.map((row) => {
        const newRow = {};
        for (const key in row) {
            if (typeof row[key] === "string") {
                newRow[key] = row[key].trim();
            }
            else {
                newRow[key] = row[key];
            }
        }
        return newRow;
    });
}

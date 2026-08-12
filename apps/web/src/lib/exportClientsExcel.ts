import * as XLSX from "xlsx";
import type { Client } from "@/types/database";

/** Neutralise les formules Excel/LibreOffice (=, +, -, @, tab, CR). */
function sanitizeExcelCell(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

export function downloadClientsExcel(clients: Client[]) {
  const rows = clients.map((c) => ({
    Prénom: sanitizeExcelCell(c.first_name ?? ""),
    Nom: sanitizeExcelCell(c.last_name ?? ""),
    Email: sanitizeExcelCell(c.email ?? ""),
    Téléphone: sanitizeExcelCell(c.phone ?? ""),
    "Créé le": new Date(c.created_at).toLocaleString("fr-FR"),
  }));

  const sheet = XLSX.utils.json_to_sheet(
    rows.length
      ? rows
      : [{ Prénom: "", Nom: "", Email: "", Téléphone: "", "Créé le": "" }],
  );
  sheet["!cols"] = [
    { wch: 16 },
    { wch: 16 },
    { wch: 32 },
    { wch: 18 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Clients");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `rc-consulting-clients-${stamp}.xlsx`);
}

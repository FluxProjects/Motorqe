import * as XLSX from 'xlsx';

// Export to CSV
export function exportToCSV(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}_${getTimestamp()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to Excel
export function exportToExcel(data: any[], fileName: string, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${fileName}_${getTimestamp()}.xlsx`);
}

// Utility: Get timestamp
function getTimestamp(): string {
  return new Date().toISOString().split('T')[0];
}

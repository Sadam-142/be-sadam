const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Pendaftaran Orditas 25 (Responses).xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
if (data.length > 0) {
  console.log("HEADERS:", data[0]);
  if (data.length > 1) {
    console.log("FIRST ROW:", data[1]);
  }
} else {
  console.log("Excel file is empty");
}

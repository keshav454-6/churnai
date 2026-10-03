/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { validateRow, ValidatedRow } from './data-validator';

// Mapping variations to standard db column names
const COLUMN_MAP: Record<string, string> = {
  'customer id': 'customer_id',
  'customerid': 'customer_id',
  'monthly charges': 'monthly_charges',
  'monthlycharges': 'monthly_charges',
  'contract type': 'contract_type',
  'contracttype': 'contract_type',
  'total charges': 'total_charges',
  'totalcharges': 'total_charges',
  'payment method': 'payment_method',
  'paymentmethod': 'payment_method',
  'internet service': 'internet_service',
  'internetservice': 'internet_service',
  'number of services': 'number_of_services',
  'numberofservices': 'number_of_services',
  'customer support calls': 'customer_support_calls',
  'customersupportcalls': 'customer_support_calls',
  'usage frequency': 'usage_frequency',
  'usagefrequency': 'usage_frequency',
  'late payments': 'late_payments',
  'latepayments': 'late_payments',
};

export const normalizeColumnName = (colName: string): string => {
  const normalized = colName.trim().toLowerCase();
  return COLUMN_MAP[normalized] || normalized.replace(/\s+/g, '_');
};

export type ParsedExcelResult = {
  totalRows: number;
  validRows: ValidatedRow[];
  invalidRows: ValidatedRow[];
  duplicatesInFile: number;
  missingValuesSummary: Record<string, number>;
};

export const parseExcelFile = (buffer: Buffer): ParsedExcelResult => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get raw JSON data
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  
  const validRows: ValidatedRow[] = [];
  const invalidRows: ValidatedRow[] = [];
  const seenIds = new Set<string>();
  let duplicatesInFile = 0;
  
  const missingValuesSummary: Record<string, number> = {
    customer_id: 0,
    age: 0,
    tenure: 0,
    monthly_charges: 0,
    contract_type: 0,
    churn: 0
  };

  rawData.forEach((row, index) => {
    // Normalize keys
    const normalizedRow: any = {};
    for (const key in row) {
      normalizedRow[normalizeColumnName(key)] = row[key];
    }

    // Track missing values for summary
    Object.keys(missingValuesSummary).forEach(col => {
      if (normalizedRow[col] === null || normalizedRow[col] === undefined || normalizedRow[col] === '') {
        missingValuesSummary[col]++;
      }
    });

    const validated = validateRow(normalizedRow, index + 2); // +2 because Excel rows are 1-indexed and have a header

    if (validated.validation.isValid) {
      const cid = normalizedRow.customer_id;
      if (seenIds.has(cid)) {
        duplicatesInFile++;
        validated.validation.isValid = false;
        validated.validation.errors.push('Duplicate customer_id in file');
        invalidRows.push(validated);
      } else {
        seenIds.add(cid);
        validRows.push(validated);
      }
    } else {
      invalidRows.push(validated);
    }
  });

  return {
    totalRows: rawData.length,
    validRows,
    invalidRows,
    duplicatesInFile,
    missingValuesSummary
  };
};


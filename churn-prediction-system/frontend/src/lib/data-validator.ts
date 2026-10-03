/* eslint-disable @typescript-eslint/no-explicit-any */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type ValidatedRow = {
  rowNumber: number;
  data: any;
  validation: ValidationResult;
};

// Normalize churn values
export const normalizeChurn = (val: any): boolean | null => {
  if (val === undefined || val === null) return null;
  const str = String(val).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(str)) return true;
  if (['no', 'n', '0', 'false'].includes(str)) return false;
  return null;
};

export const validateRow = (row: any, rowIndex: number): ValidatedRow => {
  const errors: string[] = [];

  // Required: customerId
  if (!row.customer_id) {
    errors.push('Missing customer_id');
  }

  // Age validation
  if (row.age !== undefined && row.age !== null) {
    const age = Number(row.age);
    if (isNaN(age) || age <= 0) errors.push('age must be a positive number');
  } else {
    errors.push('Missing age');
  }

  // Tenure validation
  if (row.tenure !== undefined && row.tenure !== null) {
    const tenure = Number(row.tenure);
    if (isNaN(tenure) || tenure < 0) errors.push('tenure must be a non-negative number');
  } else {
    errors.push('Missing tenure');
  }

  // Contract Type
  if (!row.contract_type) {
    errors.push('Missing contract_type');
  }

  // Monthly charges validation
  if (row.monthly_charges !== undefined && row.monthly_charges !== null) {
    const charge = Number(row.monthly_charges);
    if (isNaN(charge) || charge < 0) errors.push('monthly_charges must be a non-negative number');
  } else {
    errors.push('Missing monthly_charges');
  }
  
  // Total charges validation
  if (row.total_charges !== undefined && row.total_charges !== null) {
    const total = Number(row.total_charges);
    if (isNaN(total) || total < 0) errors.push('total_charges must be a non-negative number');
  }

  // Churn validation
  if (row.churn !== undefined && row.churn !== null) {
    const normalizedChurn = normalizeChurn(row.churn);
    if (normalizedChurn === null) errors.push('churn must be Yes or No');
    else row.churn = normalizedChurn; // Normalize it in place for import
  } else {
    errors.push('Missing churn');
  }
  
  // Number validation for other optional fields
  ['number_of_services', 'complaints', 'customer_support_calls', 'late_payments'].forEach(field => {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      const num = Number(row[field]);
      if (isNaN(num) || num < 0) errors.push(`${field} must be a non-negative number`);
    }
  });

  return {
    rowNumber: rowIndex,
    data: row,
    validation: {
      isValid: errors.length === 0,
      errors
    }
  };
};


/**
 * Utilities for data export
 */

/**
 * Converts an array of objects to a CSV string
 * @param data Array of objects to be converted
 * @param headers Headers for the CSV (optional)
 * @returns String in CSV format
 */
export const convertToCSV = <T extends Record<string, any>>(
  data: T[],
  headers?: { [key: string]: string }
): string => {
  if (data.length === 0) return '';
  
  // Get all keys from objects
  const keys = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers 
    ? keys.map(key => headers[key] || key).join(',') 
    : keys.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      // Handle special values
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and add quotes if value contains comma
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;  
      }
      return value;
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${rows}`;
};

/**
 * Exports data to a CSV file
 * @param data Array of objects to be exported
 * @param filename Name of the file to be downloaded
 * @param headers Headers for the CSV (optional)
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { [key: string]: string }
): void => {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

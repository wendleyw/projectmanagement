/**
 * Formats a date for display in local format
 * @param dateString Date string in ISO format or timestamp
 * @returns Formatted date for display
 */
export const formatDate = (dateString: string | number): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a date and time for display in local format
 * @param dateString Date string in ISO format or timestamp
 * @returns Formatted date and time for display
 */
export const formatDateTime = (dateString: string | number): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Checks if a date is in the past
 * @param dateString Date string in ISO format or timestamp
 * @returns true if the date is in the past, false otherwise
 */
export const isPastDate = (dateString: string | number): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Calculates the difference in days between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days between dates
 */
export const getDaysDifference = (startDate: string | number, endDate: string | number): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Returns the current date in YYYY-MM-DD format
 * @returns Current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Adds days to a date
 * @param dateString Initial date
 * @param days Number of days to add
 * @returns New date after adding days
 */
export const addDays = (dateString: string | number, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Formats a duration in seconds to hours:minutes format
 * @param seconds Duration in seconds
 * @returns Formatted string in Xh Ym pattern
 */
 export const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0h 0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

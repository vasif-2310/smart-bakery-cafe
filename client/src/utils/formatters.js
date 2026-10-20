/**
 * Formats a numeric price into standard Indian Rupee notation (₹)
 * Example: 1250 -> "₹1,250"
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats an ISO date string into readable date (e.g. "19 Oct 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formats date and time (e.g. "19 Oct 2026, 11:30 AM")
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats preparation time in minutes (e.g. 15 -> "15 mins")
 */
export const formatPrepTime = (minutes) => {
  if (!minutes) return 'Ready to serve';
  return `${minutes} mins`;
};

/**
 * Formats full address object into a single line string
 */
export const formatAddress = (addr) => {
  if (!addr) return '';
  const parts = [addr.street, addr.landmark, addr.city, addr.postalCode].filter(Boolean);
  return parts.join(', ');
};

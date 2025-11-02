/**
 * Utility functions for AfriBrok applications
 */

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'ETB'): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format dates
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Property type labels
export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    residential: 'Residential',
    commercial: 'Commercial',
    land: 'Land',
  };
  return labels[type] || type;
}

// Status labels and colors
export function getBrokerStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    suspended: 'Suspended',
    revoked: 'Revoked',
  };
  return labels[status] || status;
}

export function getBrokerStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    submitted: 'blue',
    approved: 'green',
    suspended: 'yellow',
    revoked: 'red',
  };
  return colors[status] || 'gray';
}

export function getListingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active',
    pending_review: 'Pending Review',
    suspended: 'Suspended',
    closed: 'Closed',
  };
  return labels[status] || status;
}

export function getListingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'green',
    pending_review: 'blue',
    suspended: 'yellow',
    closed: 'gray',
  };
  return colors[status] || 'gray';
}

// Role utilities
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    certified_broker: 'Certified Broker',
    agency: 'Real Estate Agency',
    individual_seller: 'Individual Seller',
    inspector: 'Inspector',
    regulator: 'Regulator',
    admin: 'Administrator',
    public: 'Public User',
  };
  return labels[role] || role;
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generate random ID (for temp use)
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Validate Ethiopian phone number
export function isValidEthiopianPhone(phone: string): boolean {
  // Ethiopian phone numbers: +251XXXXXXXXX or 09XXXXXXXX
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+251|0)(9|7)\d{8}$/.test(cleaned);
}

// Format Ethiopian phone number
export function formatEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    return `+251${cleaned.slice(1)}`;
  }
  return cleaned.startsWith('+251') ? cleaned : `+251${cleaned}`;
}

// Sleep utility for testing
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Deep clone utility
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Extract file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Check if file is image
export function isImageFile(filename: string): boolean {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExts.includes(getFileExtension(filename));
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
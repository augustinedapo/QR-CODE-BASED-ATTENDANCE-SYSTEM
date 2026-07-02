
// utils/formatters.ts

export const formatters = {
  // Format date
  formatDate: (date: string | Date, format: 'short' | 'long' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'short') {
      return d.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Format time
  formatTime: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  // Format datetime
  formatDateTime: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${formatters.formatDate(d, 'short')} ${formatters.formatTime(d)}`;
  },

  // Format percentage
  formatPercentage: (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
  },

  // Format currency
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format full name
  formatFullName: (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  },

  // Get initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Truncate text
  truncate: (text: string, length: number = 50): string => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Calculate duration
  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },
};
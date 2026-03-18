import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'MMMM d, yyyy'): string {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, fmt) : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'MMMM d, yyyy h:mm a');
}

export function statusColor(status: 'pending' | 'acknowledged' | 'signed') {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    acknowledged: 'bg-blue-100 text-blue-800',
    signed: 'bg-emerald-100 text-emerald-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

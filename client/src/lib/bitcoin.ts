import { type BitcoinPrice, type BitcoinChartData } from "@shared/schema";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function formatPriceChange(change: number, changePercent: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(changePercent);
  return `${formatted}%`;
}

export function formatChartData(data: BitcoinChartData) {
  return data.candles.map(([timestamp, , , , close]) => ({
    time: new Date(timestamp).toLocaleTimeString('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit'
    }),
    price: parseFloat(close)
  }));
}

export function getChangeColor(change: number): string {
  return change >= 0 ? 'text-green-500' : 'text-red-500';
}

export function formatVolume(volume: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(volume);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  // Format date as YYYYMMDD
  const dateStr = date.toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('');

  // Format time as HH:MM:SS
  const timeStr = date.toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `${dateStr} ${timeStr} GMT`;
}
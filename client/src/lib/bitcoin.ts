import { type BitcoinPrice, type BitcoinChartData } from "@shared/schema";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
    time: new Date(timestamp).toLocaleTimeString(),
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
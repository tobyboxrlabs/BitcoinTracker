import { z } from "zod";

export const bitcoinPriceSchema = z.object({
  price: z.number(),
  priceChange: z.number(),
  priceChangePercent: z.number(),
  volume: z.number(),
  lastUpdated: z.number()
});

export const timeWindowSchema = z.enum(['1h', '24h', '1w']);

export const bitcoinChartDataSchema = z.object({
  // Binance klines: [timestamp, open, high, low, close, volume, closeTime, ...]
  candles: z.array(z.tuple([
    z.number(), // timestamp
    z.string(), // open
    z.string(), // high
    z.string(), // low
    z.string(), // close
    z.string(), // volume
    z.number(), // closeTime
  ]))
});

export type BitcoinPrice = z.infer<typeof bitcoinPriceSchema>;
export type TimeWindow = z.infer<typeof timeWindowSchema>;
export type BitcoinChartData = z.infer<typeof bitcoinChartDataSchema>;
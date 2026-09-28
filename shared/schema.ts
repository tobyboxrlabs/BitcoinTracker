import { z } from "zod";

export const bitcoinPriceSchema = z.object({
  price: z.number(),
  priceChange: z.number(),
  priceChangePercent: z.number(),
  volume: z.number(),
  lastUpdated: z.number()
});

export const timeWindowSchema = z.enum(['1h', '24h', '1w']);

export const priceAlertSchema = z.object({
  targetPrice: z.number().positive("Target price must be positive"),
  isEnabled: z.boolean().default(true),
  direction: z.enum(['above', 'below']).default('above'),
});

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

export const tenderlyStackFrameSchema = z.object({
  file: z.string().optional(),
  contract: z.string().optional(),
  function: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  pc: z.number().optional(),
  error: z.string().optional(),
});

export const tenderlySimulationSchema = z.object({
  id: z.string().optional(),
  status: z.boolean(),
  gas_used: z.number().optional(),
  error_message: z.string().optional(),
  stack_trace: z.array(tenderlyStackFrameSchema).optional(),
  transaction: z.object({
    hash: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    input: z.string().optional(),
    value: z.string().optional(),
    gas: z.string().optional(),
    gas_price: z.string().optional(),
  }).optional(),
  logs: z.array(z.any()).optional(),
});

export const tenderlyTransactionSchema = z.object({
  transaction: z.object({
    hash: z.string(),
    from: z.string(),
    to: z.string().nullable(),
    input: z.string(),
    value: z.string(),
    gas: z.string(),
    gas_price: z.string().optional(),
    block_number: z.number().optional(),
    block_hash: z.string().optional(),
    transaction_index: z.number().optional(),
  }),
  simulation: tenderlySimulationSchema.optional(),
  generated_access_list: z.array(z.any()).optional(),
});

export type BitcoinPrice = z.infer<typeof bitcoinPriceSchema>;
export type TimeWindow = z.infer<typeof timeWindowSchema>;
export type PriceAlert = z.infer<typeof priceAlertSchema>;
export type BitcoinChartData = z.infer<typeof bitcoinChartDataSchema>;
export type TenderlyStackFrame = z.infer<typeof tenderlyStackFrameSchema>;
export type TenderlySimulation = z.infer<typeof tenderlySimulationSchema>;
export type TenderlyTransaction = z.infer<typeof tenderlyTransactionSchema>;
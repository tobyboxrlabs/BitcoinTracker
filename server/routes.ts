import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { bitcoinPriceSchema, bitcoinChartDataSchema, timeWindowSchema } from "@shared/schema";

function getKlineParams(timeWindow: string) {
  switch (timeWindow) {
    case '1h':
      return { interval: '1m', limit: 60 };
    case '24h':
      return { interval: '1h', limit: 24 };
    case '1w':
      return { interval: '4h', limit: 42 };
    default:
      return { interval: '1h', limit: 24 };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/bitcoin/price", async (_req, res) => {
    try {
      const response = await fetch(
        "https://api.binance.us/api/v3/ticker/24hr?symbol=BTCUSDT",
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      const price = {
        price: parseFloat(data.lastPrice),
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        volume: parseFloat(data.volume),
        lastUpdated: Date.now()
      };

      const validated = bitcoinPriceSchema.parse(price);
      res.json(validated);
    } catch (error) {
      console.error('Price API Error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch Bitcoin price" 
      });
    }
  });

  app.get("/api/bitcoin/history", async (req, res) => {
    try {
      const timeWindow = timeWindowSchema.parse(req.query.timeWindow || '24h');
      const { interval, limit } = getKlineParams(timeWindow);

      const response = await fetch(
        `https://api.binance.us/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      const chartData = {
        candles: data.map((candle: any[]) => [
          candle[0], // timestamp
          candle[1], // open
          candle[2], // high
          candle[3], // low
          candle[4], // close
          candle[5], // volume
          candle[6], // closeTime
        ])
      };

      const validated = bitcoinChartDataSchema.parse(chartData);
      res.json(validated);
    } catch (error) {
      console.error('History API Error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch Bitcoin price history" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
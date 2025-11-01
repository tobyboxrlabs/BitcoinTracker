import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { bitcoinPriceSchema, bitcoinChartDataSchema, timeWindowSchema } from "@shared/schema";
import { createHmac } from "crypto";

interface GitHubNotification {
  id: string;
  repository: string;
  pusher: string;
  ref: string;
  timestamp: number;
  dismissed: boolean;
}

const githubNotifications: GitHubNotification[] = [];

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

  app.get("/api/github/notifications", (_req, res) => {
    const activeNotifications = githubNotifications.filter(n => !n.dismissed);
    res.json(activeNotifications);
  });

  app.post("/api/github/notifications/:id/dismiss", (req, res) => {
    const { id } = req.params;
    const notification = githubNotifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      res.json({ message: "Notification dismissed" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  });

  app.post("/api/webhook/github", async (req, res) => {
    try {
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('GITHUB_WEBHOOK_SECRET not configured');
        return res.status(500).json({ message: "Webhook not configured" });
      }

      const signature = req.headers['x-hub-signature-256'] as string;
      
      if (!signature) {
        console.error('No signature provided in webhook request');
        return res.status(401).json({ message: "No signature provided" });
      }

      const payload = JSON.stringify(req.body);
      const hmac = createHmac('sha256', webhookSecret);
      const digest = 'sha256=' + hmac.update(payload).digest('hex');

      if (signature !== digest) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ message: "Invalid signature" });
      }

      const event = req.headers['x-github-event'] as string;
      const repository = req.body.repository?.full_name || 'unknown';
      const pusher = req.body.pusher?.name || 'unknown';
      const ref = req.body.ref || 'unknown';
      
      const notification: GitHubNotification = {
        id: Date.now().toString(),
        repository,
        pusher,
        ref,
        timestamp: Date.now(),
        dismissed: false
      };
      
      githubNotifications.unshift(notification);
      if (githubNotifications.length > 10) {
        githubNotifications.pop();
      }
      
      console.log('🔔 GitHub Push Notification Received!');
      console.log(`   Repository: ${repository}`);
      console.log(`   Pushed by: ${pusher}`);
      console.log(`   Branch: ${ref}`);
      console.log('   👉 Pull changes manually using: git pull origin main');
      
      res.json({ 
        message: "✅ Push notification received",
        info: {
          repository,
          pusher,
          ref,
          note: "Pull changes manually from Replit's Git pane or Shell"
        }
      });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Webhook processing failed" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
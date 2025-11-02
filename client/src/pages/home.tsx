import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, GitBranch, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice, formatPriceChange, formatChartData, getChangeColor, formatVolume, formatTimestamp } from "@/lib/bitcoin";
import { PriceAlert } from "@/components/PriceAlert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BitcoinPrice, BitcoinChartData, TimeWindow } from "@shared/schema";

interface GitHubNotification {
  id: string;
  repository: string;
  pusher: string;
  ref: string;
  timestamp: number;
  dismissed: boolean;
}

export default function Home() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const {
    data: price,
    error: priceError,
    isLoading: isPriceLoading
  } = useQuery<BitcoinPrice>({
    queryKey: ["/api/bitcoin/price"],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const {
    data: history,
    error: historyError,
    isLoading: isHistoryLoading
  } = useQuery<BitcoinChartData>({
    queryKey: [`/api/bitcoin/history?timeWindow=${timeWindow}`],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: notifications = [] } = useQuery<GitHubNotification[]>({
    queryKey: ["/api/github/notifications"],
    refetchInterval: 5000 // Check for notifications every 5 seconds
  });

  const dismissNotification = async (id: string) => {
    await apiRequest("POST", `/api/github/notifications/${id}/dismiss`);
    queryClient.invalidateQueries({ queryKey: ["/api/github/notifications"] });
  };

  if (priceError || historyError) {
    return (
      <Alert variant="destructive" className="mx-4 mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to fetch Bitcoin data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {notifications.length > 0 && (
        <div className="max-w-2xl mx-auto mb-6">
          {notifications.map((notification) => (
            <Alert key={notification.id} className="border-primary bg-primary/10 mb-2" data-testid={`notification-${notification.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <GitBranch className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-semibold text-primary">
                      New GitHub Push! 🚀
                    </div>
                    <AlertDescription className="mt-1">
                      <strong>{notification.pusher}</strong> pushed to <strong>{notification.ref.replace('refs/heads/', '')}</strong>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pull changes from Replit's Git pane or Shell
                      </div>
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-6 w-6 shrink-0"
                  data-testid={`dismiss-notification-${notification.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-8">
        <img
          src="/assets/cyberpunk-logo.png"
          alt="Cyberpunk Bitcoin Tracker"
          className="h-12 md:h-16 w-auto rounded-full"
        />
        <h1 className="text-3xl font-bold text-center flex-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Bitcoin Tracker (cursor agent update2)
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground">
                Bitcoin Price (BTCUSDT)
              </h2>

              {isPriceLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-48 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </div>
              ) : price ? (
                <>
                  <div className="text-4xl font-bold tracking-tighter">
                    {formatPrice(price.price)}
                  </div>
                  <div className={getChangeColor(price.priceChange)}>
                    {formatPriceChange(price.priceChange, price.priceChangePercent)} (24h)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Volume: {formatVolume(price.volume)} USDT
                  </div>
                </>
              ) : null}
            </div>

            <div className="text-sm text-muted-foreground space-y-1 mt-6">
              <div>Last price: {price ? formatTimestamp(price.lastUpdated) : ''}</div>
              <div>Time now: {formatTimestamp(currentTime)}</div>
            </div>
          </CardContent>
        </Card>

        {price && <PriceAlert currentPrice={price.price} />}

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-muted-foreground">
                Price History
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={timeWindow === '1h' ? 'default' : 'outline'}
                  onClick={() => setTimeWindow('1h')}
                  size="sm"
                >
                  1H
                </Button>
                <Button
                  variant={timeWindow === '24h' ? 'default' : 'outline'}
                  onClick={() => setTimeWindow('24h')}
                  size="sm"
                >
                  24H
                </Button>
                <Button
                  variant={timeWindow === '1w' ? 'default' : 'outline'}
                  onClick={() => setTimeWindow('1w')}
                  size="sm"
                >
                  1W
                </Button>
              </div>
            </div>

            {isHistoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : history ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData(history)}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(320 100% 60%)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(320 100% 60%)" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(320 100% 60%)" floodOpacity="0.5"/>
                      </filter>
                    </defs>
                    <XAxis
                      dataKey="time"
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      domain={['auto', 'auto']}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(320 100% 60%)"
                      strokeWidth={2}
                      dot={false}
                      filter="url(#shadow)"
                      fill="url(#lineGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

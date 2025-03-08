import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice, formatPriceChange, formatChartData, getChangeColor, formatVolume, formatTimestamp } from "@/lib/bitcoin";
import type { BitcoinPrice, BitcoinChartData } from "@shared/schema";

export default function Home() {
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
    queryKey: ["/api/bitcoin/history"],
    refetchInterval: 60000 // Refresh every minute
  });

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
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 relative">
            <div className="absolute top-2 right-2 text-sm text-muted-foreground">
              {price ? formatTimestamp(price.lastUpdated) : ''}
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-muted-foreground mb-4">
              24h Price History
            </h2>

            {isHistoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : history ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData(history)}>
                    <XAxis
                      dataKey="time"
                      fontSize={12}
                    />
                    <YAxis
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
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
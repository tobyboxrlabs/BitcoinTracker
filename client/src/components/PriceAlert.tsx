import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { priceAlertSchema, type PriceAlert } from "@shared/schema";

interface Props {
  currentPrice: number;
}

export function PriceAlert({ currentPrice }: Props) {
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  const form = useForm<PriceAlert>({
    resolver: zodResolver(priceAlertSchema),
    defaultValues: {
      targetPrice: currentPrice,
      direction: 'above',
      isEnabled: true
    }
  });

  useEffect(() => {
    // Check if we already have permission
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setHasPermission(true);
      } else if (Notification.permission !== "denied") {
        // Request permission if not already denied
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === "granted");
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!form.getValues("isEnabled")) return;

    const targetPrice = form.getValues("targetPrice");
    const direction = form.getValues("direction");

    if (direction === 'above' && currentPrice > targetPrice) {
      new Notification("Bitcoin Price Alert", {
        body: `Bitcoin price is now above $${targetPrice.toLocaleString()}!`,
        icon: "/favicon.ico"
      });
      form.setValue("isEnabled", false);
    } else if (direction === 'below' && currentPrice < targetPrice) {
      new Notification("Bitcoin Price Alert", {
        body: `Bitcoin price is now below $${targetPrice.toLocaleString()}!`,
        icon: "/favicon.ico"
      });
      form.setValue("isEnabled", false);
    }
  }, [currentPrice, form]);

  const onSubmit = (data: PriceAlert) => {
    if (!hasPermission) {
      // If we don't have permission, request it again
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === "granted");
          if (permission === "granted") {
            form.reset(data);
            toast({
              title: "Price Alert Set",
              description: `You will be notified when the price goes ${data.direction} $${data.targetPrice.toLocaleString()}`
            });
          } else {
            toast({
              variant: "destructive",
              title: "Notification Permission Required",
              description: "Please enable notifications to use this feature."
            });
          }
        });
      }
      return;
    }

    form.reset(data);
    toast({
      title: "Price Alert Set",
      description: `You will be notified when the price goes ${data.direction} $${data.targetPrice.toLocaleString()}`
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price (USD)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              {...form.register("targetPrice", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label>Alert me when price goes</Label>
            <RadioGroup
              defaultValue="above"
              className="flex space-x-4"
              {...form.register("direction")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="above" id="above" />
                <Label htmlFor="above">Above target</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="below" id="below" />
                <Label htmlFor="below">Below target</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit"
            className="w-full"
          >
            Set Price Alert
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
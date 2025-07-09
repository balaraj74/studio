import MarketPageClient from "./MarketPageClient";
import { marketPrices, states, crops } from "@/lib/data";

export default function MarketPage() {
  // In a real app, this data would likely be fetched from an API
  const prices = marketPrices;
  
  return <MarketPageClient prices={prices} states={states} crops={crops} />;
}

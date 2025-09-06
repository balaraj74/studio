
'use server';

/**
 * @fileOverview An AI flow to simulate market matchmaking for farmers.
 * 
 * - findBestBuyers - Analyzes a farmer's crop details and matches them with simulated buyers.
 * - FindBestBuyersInput - The input type for the function.
 * - FindBestBuyersOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

export const FindBestBuyersInputSchema = z.object({
  cropType: z.string().describe("The type of crop the farmer wants to sell, e.g., 'Tomatoes', 'Wheat'."),
  quantity: z.number().describe("The quantity of the crop available for sale."),
  unit: z.enum(["kg", "quintal", "tonne"]).describe("The unit for the quantity."),
  location: z.string().describe("The farmer's location, e.g., 'Kolar, Karnataka'."),
  sellByDate: z.string().describe("The preferred date by which the farmer wants to sell, in 'YYYY-MM-DD' format."),
});
export type FindBestBuyersInput = z.infer<typeof FindBestBuyersInputSchema>;

const BuyerMatchSchema = z.object({
    buyerName: z.string().describe("The name of the potential buyer, e.g., 'City Agro Traders' or 'Local Mandi Wholesaler'."),
    buyerType: z.enum(["Wholesaler", "Retailer", "Exporter", "Food Processor"]).describe("The type of the buyer."),
    location: z.string().describe("The buyer's location."),
    offerPrice: z.number().describe("The price per unit offered by the buyer."),
    offerUnit: z.string().describe("The unit for the offered price, matching the farmer's unit."),
    pickupOrDelivery: z.enum(["Pickup", "Delivery"]).describe("Whether the buyer will pick up from the farm or if the farmer needs to deliver."),
    summary: z.string().describe("A simple, one-sentence summary of the offer, e.g., 'Good local price, pickup tomorrow.'."),
    rating: z.number().min(1).max(5).describe("A simulated trust rating for the buyer, from 1 to 5."),
});

export const FindBestBuyersOutputSchema = z.object({
  matches: z.array(BuyerMatchSchema).describe("A list of the top 3-5 best buyer matches for the farmer."),
  overallSummary: z.string().describe("A brief, encouraging summary of the market situation for the farmer's crop."),
});
export type FindBestBuyersOutput = z.infer<typeof FindBestBuyersOutputSchema>;


export async function findBestBuyers(input: FindBestBuyersInput): Promise<FindBestBuyersOutput> {
  return marketMatchmakingFlow(input);
}


const marketMatchmakingFlow = ai.defineFlow(
  {
    name: 'marketMatchmakingFlow',
    inputSchema: FindBestBuyersInputSchema,
    outputSchema: FindBestBuyersOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-1.5-flash'),
          system: `You are an expert AI Market Matchmaking engine for Indian farmers. Your task is to analyze a farmer's crop supply and find the best potential buyers from a simulated market.

          You must generate a list of 3 to 5 plausible and diverse buyer matches. The matches should be realistic for the Indian context.
          
          For each buyer, you need to create:
          - A realistic name and buyer type (e.g., 'Kolar Super Foods' - Food Processor).
          - A plausible location (some local, some in a nearby major city).
          - An offer price that is realistic for the given crop and market conditions. Vary the prices slightly between buyers.
          - Specify if it's pickup or delivery.
          - A simple, helpful one-sentence summary of the offer.
          - A trust rating between 3.5 and 5.

          Finally, provide a brief, encouraging overall summary.
          `,
          prompt: `
            A farmer has the following crop to sell. Find the best buyer matches for them.

            - **Crop:** ${input.cropType}
            - **Quantity:** ${input.quantity} ${input.unit}
            - **Location:** ${input.location}
            - **Preferred Sell-by Date:** ${input.sellByDate}
            
            Generate a list of the top 3-5 buyer matches based on these details.
          `,
          output: {
              schema: FindBestBuyersOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in marketMatchmakingFlow:", error);
       throw new Error("The AI model could not find buyer matches at this time. Please try again.");
    }
  }
);

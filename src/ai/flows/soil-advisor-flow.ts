
'use server';

/**
 * @fileOverview An AI-powered assistant for soil health and fertilizer recommendations.
 * 
 * - getSoilAdvice - Analyzes soil data to provide fertilizer and management advice.
 * - GetSoilAdviceInput - The input type for the function.
 * - GetSoilAdviceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

export const GetSoilAdviceInputSchema = z.object({
  cropName: z.string().describe("The name of the crop the farmer plans to grow, e.g., 'Maize', 'Paddy'."),
  soilPh: z.coerce.number().describe("The pH level of the soil, e.g., 6.5."),
  nitrogen: z.coerce.number().describe("Nitrogen (N) level in kg/ha, e.g., 45."),
  phosphorus: z.coerce.number().describe("Phosphorus (P) level in kg/ha, e.g., 20."),
  potassium: z.coerce.number().describe("Potassium (K) level in kg/ha, e.g., 30."),
  language: z.string().describe("The language for the response, e.g., 'English', 'Kannada'."),
});
export type GetSoilAdviceInput = z.infer<typeof GetSoilAdviceInputSchema>;


const NutrientStatusSchema = z.object({
    nutrient: z.enum(["pH", "Nitrogen", "Phosphorus", "Potassium"]),
    status: z.enum(["Very Low", "Low", "Sufficient", "High", "Very High", "Optimal", "Slightly Acidic", "Slightly Alkaline"]),
    comment: z.string().describe("A brief, one-sentence comment on the nutrient's status."),
});

const FertilizerRecommendationSchema = z.object({
    fertilizerName: z.string().describe("The common name of the chemical fertilizer, e.g., 'Urea', 'DAP'."),
    dosage: z.string().describe("The recommended dosage per acre, including units, e.g., '45 kg/acre'."),
    applicationTime: z.string().describe("When to apply the fertilizer, e.g., 'Basal dose' or '30 days after sowing'."),
});

const OrganicAlternativeSchema = z.object({
    name: z.string().describe("The name of the organic alternative, e.g., 'Farm Yard Manure', 'Neem Cake'."),
    applicationRate: z.string().describe("The recommended application rate, e.g., '10 tonnes/acre'."),
    benefits: z.string().describe("A brief description of the benefits."),
});


export const GetSoilAdviceOutputSchema = z.object({
  nutrientAnalysis: z.array(NutrientStatusSchema).describe("An analysis of each key nutrient's status."),
  chemicalRecommendations: z.array(FertilizerRecommendationSchema).describe("A list of recommended chemical fertilizers and their dosages."),
  organicAlternatives: z.array(OrganicAlternativeSchema).describe("A list of organic alternatives to improve soil health."),
  soilManagementTips: z.string().describe("A bulleted list of general soil management practices to improve fertility and health."),
});
export type GetSoilAdviceOutput = z.infer<typeof GetSoilAdviceOutputSchema>;


export async function getSoilAdvice(input: GetSoilAdviceInput): Promise<GetSoilAdviceOutput> {
  return getSoilAdviceFlow(input);
}


const getSoilAdviceFlow = ai.defineFlow(
  {
    name: 'getSoilAdviceFlow',
    inputSchema: GetSoilAdviceInputSchema,
    outputSchema: GetSoilAdviceOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-1.5-flash'),
          system: `You are an expert agronomist AI specializing in Indian soil conditions. Your task is to provide a detailed and farmer-friendly soil health report.
          
          You will analyze the provided soil data and generate recommendations for the specified crop. The entire response, including all names and descriptions, must be in the requested language: ${input.language}.
          
          Instructions:
          1.  **Nutrient Analysis**: For each nutrient (pH, Nitrogen, Phosphorus, Potassium), determine its status (e.g., Low, Sufficient, High) and provide a simple one-sentence comment.
          2.  **Chemical Recommendations**: Recommend a set of common chemical fertilizers (like Urea, DAP, MOP). For each, specify the dosage in 'kg per acre' and the best time to apply it.
          3.  **Organic Alternatives**: Suggest at least two organic options (like FYM, Vermicompost, Neem Cake). Provide a practical application rate (e.g., 'tonnes/acre') and briefly explain the benefits.
          4.  **Soil Management Tips**: Provide a simple, bulleted list of 3-4 practical tips for long-term soil health improvement.
          `,
          prompt: `
            A farmer has provided the following soil data for their field. Please generate a comprehensive soil health and fertilizer recommendation report.

            - **Planned Crop:** ${input.cropName}
            - **Soil pH:** ${input.soilPh}
            - **Nitrogen (N):** ${input.nitrogen} kg/ha
            - **Phosphorus (P):** ${input.phosphorus} kg/ha
            - **Potassium (K):** ${input.potassium} kg/ha
            - **Response Language:** ${input.language}
            
            Generate the structured report based on these details.
          `,
          output: {
              schema: GetSoilAdviceOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in getSoilAdviceFlow:", error);
       throw new Error("The AI model could not generate soil advice. Please try again.");
    }
  }
);

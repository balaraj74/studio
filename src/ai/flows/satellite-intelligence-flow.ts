
'use server';

/**
 * @fileOverview An AI flow to simulate satellite-powered field intelligence.
 * 
 * - getSatelliteIntelligence - A function that generates a simulated analysis of a farm field
 *   including boundaries, crop health, and disease hotspots.
 * - GetSatelliteIntelligenceInput - The input type for the function.
 * - GetSatelliteIntelligenceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';


const GetSatelliteIntelligenceInputSchema = z.object({
  fieldDescription: z.string().describe("A natural language description of the farm field's location, crop, and approximate size, e.g., 'A 5-acre rice paddy in Mandya, Karnataka'."),
});
export type GetSatelliteIntelligenceInput = z.infer<typeof GetSatelliteIntelligenceInputSchema>;

const PointSchema = z.object({
  lat: z.number().describe("The latitude of the point."),
  lng: z.number().describe("The longitude of the point."),
});

const DiseaseHotspotSchema = z.object({
    riskLevel: z.enum(["Low", "Medium", "High"]).describe("The predicted risk level for the disease hotspot."),
    diseaseName: z.string().describe("The name of the potential disease, e.g., 'Rice Blast'."),
    reason: z.string().describe("A brief explanation for the risk, combining weather and crop status."),
    suggestedAction: z.string().describe("A simple, actionable suggestion for the farmer."),
});

const GetSatelliteIntelligenceOutputSchema = z.object({
  fieldBoundaries: z.array(PointSchema).describe("A plausible, simulated set of 4-6 GPS coordinates that form the corners of the described field boundary."),
  cropHealth: z.object({
      status: z.enum(["Healthy", "Mild Stress", "Poor Health"]).describe("The overall crop health status based on a simulated NDVI analysis."),
      summary: z.string().describe("A simple, one-sentence summary of the crop health."),
  }),
  diseaseHotspots: z.array(DiseaseHotspotSchema).describe("A list of potential disease hotspots, including risk level, reason, and suggested actions."),
  overallSummary: z.string().describe("A brief, easy-to-understand summary of all findings for the farmer."),
});
export type GetSatelliteIntelligenceOutput = z.infer<typeof GetSatelliteIntelligenceOutputSchema>;

export async function getSatelliteIntelligence(input: GetSatelliteIntelligenceInput): Promise<GetSatelliteIntelligenceOutput> {
  return satelliteIntelligenceFlow(input);
}


const satelliteIntelligenceFlow = ai.defineFlow(
  {
    name: 'satelliteIntelligenceFlow',
    inputSchema: GetSatelliteIntelligenceInputSchema,
    outputSchema: GetSatelliteIntelligenceOutputSchema,
  },
  async ({ fieldDescription }) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-1.5-flash'),
          system: `You are an expert agricultural remote sensing AI. Your task is to simulate a satellite imagery analysis based on a user's description of a farm field. You must generate plausible, realistic-looking data for the response schema.`,
          prompt: `
            Analyze the following field description and generate a simulated satellite intelligence report.
            
            **Field Description:** "${fieldDescription}"

            **Your Tasks:**
            1.  **Automated Field Mapping:** Generate a realistic, closed-loop polygon of 4 to 6 GPS coordinates that could represent this field. The coordinates should be geographically plausible for the described location.
            2.  **Crop Health Monitoring (Simulated NDVI):** Determine a crop health status (Healthy, Mild Stress, or Poor Health). Provide a simple, one-sentence summary.
            3.  **Disease Hotspot Detection:** Based on the crop and typical weather for the region, identify 1-2 potential disease hotspots. For each, provide a risk level, the potential disease, a simple reason (e.g., "High humidity and dense crop growth"), and a practical suggested action (e.g., "Scout the western edge of the field for early signs of leaf spots").
            4.  **Overall Summary:** Write a very brief, easy-to-understand summary of your findings for a farmer.
          `,
          output: {
              schema: GetSatelliteIntelligenceOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in satelliteIntelligenceFlow:", error);
       throw new Error("The AI model could not generate the intelligence report. Please try again.");
    }
  }
);

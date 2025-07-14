
'use server';

/**
 * @fileOverview Identifies a plant from an image and diagnoses any diseases, providing treatment advice.
 *
 * - diagnoseCropDisease - A function that handles the plant identification and diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeatherInfo } from './weather-search';

const DiagnoseCropDiseaseInputSchema = z.object({
  imageUris: z.array(z.string()).describe("A list of photos of a plant leaf, as data URIs. Up to 5 images. Format: 'data:<mimetype>;base64,<encoded_data>'."),
  geolocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).describe("The geolocation where the images were taken."),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  plantIdentification: z.object({
      isPlant: z.boolean().describe("Confirms if the image contains a plant."),
      plantName: z.string().describe("The common name of the identified plant. 'Unknown' if not identifiable."),
      confidence: z.number().min(0).max(1).describe("The AI's confidence in the plant identification, from 0.0 to 1.0."),
  }),
  diseaseDiagnosis: z.object({
    diseaseName: z.string().describe("Name of the detected disease, stress, or nutrient deficiency. 'Healthy' if no issue is found."),
    severity: z.enum(["Low", "Medium", "High", "Unknown"]).describe("The severity level of the issue."),
    affectedParts: z.array(z.string()).describe("The plant parts that are affected (e.g., 'Leaves', 'Stem', 'Fruit')."),
    suggestedRemedy: z.string().describe("A very detailed, step-by-step suggested chemical or organic treatment or remedy plan."),
    preventiveMeasures: z.string().describe("A comprehensive list of detailed preventive measures to avoid this issue in the future."),
    alternativeRemedies: z.string().describe("A detailed, step-by-step guide to alternative or home-based remedies that can be tried."),
    confidenceScore: z.number().min(0).max(1).describe("The AI's confidence in the diagnosis, from 0.0 to 1.0."),
  }),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

const diagnoseCropDiseasePromptText = `You are an expert agronomist and plant pathologist AI. Your task is two-fold:
1.  First, identify the plant from the provided image(s). Determine if it is a plant, its common name, and your confidence in this identification.
2.  Second, analyze the identified plant for any visible signs of disease, stress, or nutrient deficiency.

Return a detailed diagnosis with:
  - Plant Identification: { isPlant, plantName, confidence }
  - Disease Diagnosis: { diseaseName, severity, affectedParts, suggestedRemedy, preventiveMeasures, alternativeRemedies, confidenceScore }

IMPORTANT: For 'suggestedRemedy', 'preventiveMeasures', and 'alternativeRemedies', provide very detailed, comprehensive, and step-by-step instructions. The advice should be practical and easy for a farmer to follow.

Use the following contextual information to refine your analysis, especially the weather conditions.

CONTEXT:
- Geolocation: Latitude {{geolocation.latitude}}, Longitude {{geolocation.longitude}}
- Current Weather: {{json weather}}
`;

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {
    schema: z.object({
        geolocation: DiagnoseCropDiseaseInputSchema.shape.geolocation,
        weather: z.any().optional().describe("Current weather conditions at the location."),
    })
  },
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: diagnoseCropDiseasePromptText,
});


const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => {
    try {
      // 1. Fetch weather data
      let weatherData = null;
      try {
        weatherData = await getWeatherInfo({
            lat: input.geolocation.latitude,
            lon: input.geolocation.longitude
        });
      } catch (weatherError) {
          console.warn("Could not fetch weather data, proceeding without it.", weatherError);
      }
      
      // 2. Build the final text prompt with weather data
      const weatherInfo = weatherData ? JSON.stringify(weatherData, null, 2) : "Not available";
      const promptText = `You are an expert agronomist and plant pathologist AI. Your task is two-fold:
1.  First, identify the plant from the provided image(s). Determine if it is a plant, its common name, and your confidence in this identification.
2.  Second, analyze the identified plant for any visible signs of disease, stress, or nutrient deficiency.

Return a detailed diagnosis with:
  - Plant Identification: { isPlant, plantName, confidence }
  - Disease Diagnosis: { diseaseName, severity, affectedParts, suggestedRemedy, preventiveMeasures, alternativeRemedies, confidenceScore }

IMPORTANT: For 'suggestedRemedy', 'preventiveMeasures', and 'alternativeRemedies', provide very detailed, comprehensive, and step-by-step instructions. The advice should be practical and easy for a farmer to follow.

Use the following contextual information to refine your analysis, especially the weather conditions.

CONTEXT:
- Geolocation: Latitude ${input.geolocation.latitude}, Longitude ${input.geolocation.longitude}
- Current Weather: ${weatherInfo}
`;
      
      // 3. Construct the multimodal prompt payload
      const promptPayload = [
        ...input.imageUris.map(uri => ({ media: { url: uri } })),
        { text: promptText },
      ];
      
      // 4. Call the AI model with the constructed payload
      const { output } = await ai.generate({
        prompt: promptPayload,
        model: 'googleai/gemini-2.0-flash',
        output: { schema: DiagnoseCropDiseaseOutputSchema },
      });

      if (!output) {
        throw new Error("No output was generated by the AI model.");
      }
      return output;

    } catch (error) {
       console.error("Error in diagnoseCropDiseaseFlow:", error);
       // Re-throw a more user-friendly error to be caught by the frontend.
       throw new Error("The AI model is currently unavailable or experiencing high load. Please try again in a few moments.");
    }
  }
);

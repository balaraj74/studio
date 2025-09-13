
'use server';

/**
 * @fileOverview Identifies a plant from an image and diagnoses any diseases, providing treatment advice in a specified language.
 *
 * - diagnoseCropDisease - A function that handles the plant identification and diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeatherInfo } from './weather-search';
import { googleAI } from '@genkit-ai/googleai';
import { addDiagnosisRecord, getDiagnosisHistory } from '@/lib/actions/diagnoses';
import { storage } from '@/lib/firebase/config';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';


const DiagnoseCropDiseaseInputSchema = z.object({
  imageUris: z.array(z.string()).describe("A list of photos of a plant leaf, as data URIs. Up to 5 images. Format: 'data:<mimetype>;base64,<encoded_data>'."),
  geolocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).describe("The geolocation where the images were taken."),
  userId: z.string().describe("The ID of the user requesting the diagnosis for history tracking."),
  language: z.string().describe("The language for the response, e.g., 'English', 'Kannada', 'Hindi'."),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  plantIdentification: z.object({
      isPlant: z.boolean().describe("Confirms if the image contains a plant. Set to false if the image quality is too poor (e.g., blurry, dark, partial view) to make a reliable identification."),
      plantName: z.string().describe("The common name of the identified plant. If not identifiable or if image quality is poor, provide a reason (e.g., 'Image too blurry', 'Not a plant')."),
      confidence: z.number().min(0).max(1).describe("The AI's confidence in the plant identification, from 0.0 to 1.0."),
  }),
  diseaseDiagnosis: z.object({
    diseaseName: z.string().describe("Name of the detected disease. 'Healthy' if no issue is found. 'Uncertain' if confidence is too low."),
    severity: z.enum(["Low", "Medium", "High", "Unknown"]).describe("The severity level of the issue."),
    affectedParts: z.array(z.string()).describe("The plant parts that are affected (e.g., 'Leaves', 'Stem', 'Fruit')."),
    confidenceScore: z.number().min(0).max(1).describe("The AI's confidence in the diagnosis, from 0.0 to 1.0."),
  }),
  remedies: z.object({
    chemicalRemedy: z.string().describe("A detailed, step-by-step suggested chemical treatment plan, including common safe pesticide/fungicide names and recommended dosage."),
    organicRemedy: z.string().describe("A detailed, step-by-step guide to organic or home-based remedies that can be tried."),
    preventiveMeasures: z.string().describe("A comprehensive list of detailed preventive measures to avoid this issue in the future (e.g., soil treatment, irrigation adjustments)."),
  }),
  historicalInsight: z.string().describe("A plausible, simulated historical insight based on the location and season (e.g., 'Last year in your region, X% of crops faced fungal rust in September')."),
  farmingRecommendations: z.object({
      alternativeCrops: z.string().describe("Suggestions for alternative crops or crop rotation practices that can reduce the chances of this disease recurring."),
      preservationTips: z.string().describe("Recommendations and tips for preserving the unaffected produce from the harvest."),
  }),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}


async function uploadImageToStorage(dataUri: string, userId: string): Promise<string> {
    const storageRef = ref(storage, `diagnoses/${userId}/${Date.now()}.jpg`);
    // 'data_url' is the format Firebase Storage expects for data URIs
    const snapshot = await uploadString(storageRef, dataUri, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}


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
      
      // 2. Fetch user's diagnosis history
      let historyData = "No previous diagnosis history available.";
      try {
          const historyRecords = await getDiagnosisHistory(input.userId);
          if (historyRecords.length > 0) {
              historyData = historyRecords.slice(0, 5).map(record => 
                  `- Date: ${record.timestamp.toLocaleDateString()}, Plant: ${record.plantName}, Disease: ${record.diseaseName}, Severity: ${record.severity}`
              ).join('\n');
          }
      } catch (historyError) {
          console.warn("Could not fetch diagnosis history.", historyError);
      }

      const weatherInfo = weatherData ? JSON.stringify(weatherData, null, 2) : "Not available";
      const promptText = `You are an expert agronomist and plant pathologist AI. Your task is to provide a comprehensive crop health report.
IMPORTANT: Generate the entire response, including all names and descriptions, in the following language: ${input.language}.

1.  **Image Quality Check**: First, analyze the image quality. If it's too blurry, dark, or partial, set 'isPlant' to false and explain the issue in 'plantName'. Do not proceed with diagnosis.
2.  **Plant Identification**: If the image is clear, identify the plant, its common name, and your confidence.
3.  **Disease Diagnosis**: Analyze the plant for any signs of disease, stress, or deficiency. Determine the disease name, severity, affected parts, and your confidence score.
4.  **Generate Comprehensive Report**: Based on your analysis and the context below, provide a full report in the required JSON format.

The final output must be structured into these sections:
-   **Plant Identification**: { isPlant, plantName, confidence }
-   **Disease Diagnosis**: { diseaseName, severity, affectedParts, confidenceScore }
-   **Remedies**:
    -   `chemicalRemedy`: Provide a detailed, step-by-step chemical solution, including common safe pesticide/fungicide names and specific dosage instructions.
    -   `organicRemedy`: Provide a detailed, step-by-step guide to an effective organic or home-based remedy.
    -   `preventiveMeasures`: List comprehensive preventive actions for the future, like soil treatment or irrigation adjustments.
-   **Historical Insight**: Generate a plausible, simulated historical insight based on the location and season (e.g., "Last year in your district, there was a noticeable increase in fungal blight cases during the monsoon season.").
-   **Farming Recommendations**:
    -   `alternativeCrops`: Suggest alternative crops or specific crop rotation practices to reduce the recurrence of this disease.
    -   `preservationTips`: Provide practical tips for preserving the currently unaffected produce from the harvest.

Use the following contextual information to refine your analysis. Pay close attention to the user's past diagnosis history to identify recurring issues.

CONTEXT:
- Geolocation: Latitude ${input.geolocation.latitude}, Longitude ${input.geolocation.longitude}
- Current Weather & Forecast: ${weatherInfo}
- User's Recent Diagnosis History:
${historyData}
`;
      
      const promptPayload = [
        ...input.imageUris.map(uri => ({ media: { url: uri } })),
        { text: promptText },
      ];
      
      const { output } = await ai.generate({
        prompt: promptPayload,
        model: googleAI.model('gemini-1.5-flash'),
        output: { schema: DiagnoseCropDiseaseOutputSchema },
      });

      if (!output) {
        throw new Error("No output was generated by the AI model.");
      }

      if (output.plantIdentification.isPlant && input.imageUris.length > 0) {
          try {
              const imageUrl = await uploadImageToStorage(input.imageUris[0], input.userId);
              await addDiagnosisRecord(input.userId, {
                  plantName: output.plantIdentification.plantName,
                  diseaseName: output.diseaseDiagnosis.diseaseName,
                  severity: output.diseaseDiagnosis.severity,
                  confidenceScore: output.diseaseDiagnosis.confidenceScore,
                  imageUrl: imageUrl,
                  geolocation: input.geolocation,
              });
          } catch (historyError) {
              console.error("Failed to save diagnosis history:", historyError);
          }
      }

      return output;

    } catch (error: any) {
       console.error("Error in diagnoseCropDiseaseFlow:", error);
       throw new Error(`The AI model failed to process the request. Details: ${error.message || 'Unknown error'}`);
    }
  }
);


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
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { addDiagnosisRecord, getDiagnosisHistory } from '@/lib/actions/diagnoses';
import { storage } from '@/lib/firebase/config';


const DiagnoseCropDiseaseInputSchema = z.object({
  imageUris: z.array(z.string()).describe("A list of photos of a plant leaf, as data URIs. Up to 5 images. Format: 'data:<mimetype>;base64,<encoded_data>'."),
  geolocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).describe("The geolocation where the images were taken."),
  language: z.string().default('English').describe("The language for the output, e.g., 'English', 'Kannada', 'Hindi'."),
  userId: z.string().describe("The ID of the user requesting the diagnosis for history tracking."),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  plantIdentification: z.object({
      isPlant: z.boolean().describe("Confirms if the image contains a plant. Set to false if the image quality is too poor (e.g., blurry, dark, partial view) to make a reliable identification."),
      plantName: z.string().describe("The common name of the identified plant in the requested language. If not identifiable or if image quality is poor, provide a reason (e.g., 'Image too blurry', 'Not a plant')."),
      confidence: z.number().min(0).max(1).describe("The AI's confidence in the plant identification, from 0.0 to 1.0."),
  }),
  diseaseDiagnosis: z.object({
    diseaseName: z.string().describe("Name of the detected disease in the requested language. 'Healthy' if no issue is found. 'Uncertain' if confidence is too low."),
    severity: z.enum(["Low", "Medium", "High", "Unknown"]).describe("The severity level of the issue."),
    affectedParts: z.array(z.string()).describe("The plant parts that are affected (e.g., 'Leaves', 'Stem', 'Fruit') in the requested language."),
    suggestedRemedy: z.string().describe("A very detailed, step-by-step suggested chemical or organic treatment or remedy plan, written in the requested language."),
    preventiveMeasures: z.string().describe("A comprehensive list of detailed preventive measures to avoid this issue in the future, written in the requested language."),
    alternativeRemedies: z.string().describe("A detailed, step-by-step guide to alternative or home-based remedies that can be tried, written in the requested language."),
    confidenceScore: z.number().min(0).max(1).describe("The AI's confidence in the diagnosis, from 0.0 to 1.0."),
  }),
  riskPrediction: z.object({
    nextRisk: z.string().describe("The name of the most likely next disease or pest risk, e.g., 'Aphid Infestation' or 'Downy Mildew'."),
    timeline: z.string().describe("The predicted timeline for this risk, e.g., 'In the next 7-10 days'."),
    reasoning: z.string().describe("A brief explanation for the prediction, linking current conditions, diagnosis, and weather."),
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
              // Format the last 5 records for the prompt
              historyData = historyRecords.slice(0, 5).map(record => 
                  `- Date: ${record.timestamp.toLocaleDateString()}, Plant: ${record.plantName}, Disease: ${record.diseaseName}, Severity: ${record.severity}`
              ).join('\n');
          }
      } catch (historyError) {
          console.warn("Could not fetch diagnosis history.", historyError);
      }

      // 3. Build the final text prompt with weather data, history, and language instruction
      const weatherInfo = weatherData ? JSON.stringify(weatherData, null, 2) : "Not available";
      const promptText = `You are an expert agronomist and plant pathologist AI. Your task is two-fold:
IMPORTANT: Generate the entire response, including all names and descriptions, in the following language: ${input.language}.

1.  First, analyze the image quality. If the image is too blurry, dark, or shows only a partial leaf, set 'isPlant' to false and use 'plantName' to explain the issue (e.g., 'Image is too blurry'). Do not proceed with diagnosis.
2.  If the image is clear, identify the plant. Determine if it is a plant, its common name, and your confidence.
3.  Second, analyze the identified plant for any visible signs of disease, stress, or nutrient deficiency. If your confidence in a specific disease is low (below 0.7), set diseaseName to 'Uncertain' and confidenceScore to your low score.
4.  Third, based on the current diagnosis, weather forecast, and past history, predict the most likely upcoming risk (disease or pest) and provide a timeline and reasoning.

Return a detailed diagnosis with:
  - Plant Identification: { isPlant, plantName, confidence }
  - Disease Diagnosis: { diseaseName, severity, affectedParts, suggestedRemedy, preventiveMeasures, alternativeRemedies, confidenceScore }
  - Risk Prediction: { nextRisk, timeline, reasoning }

IMPORTANT: For 'suggestedRemedy', 'preventiveMeasures', and 'alternativeRemedies', provide very detailed, comprehensive, and step-by-step instructions. The advice should be practical and easy for a farmer to follow.

Use the following contextual information to refine your analysis. Pay close attention to the user's past diagnosis history to identify recurring issues. If the current diagnosis matches a past issue, mention this and consider increasing the confidence score.

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

      // 4. (New) After successful diagnosis, upload image and save history
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
              // Do not block the main response if history saving fails
          }
      }

      return output;

    } catch (error: any) {
       console.error("Error in diagnoseCropDiseaseFlow:", error);
       throw new Error(`The AI model failed to process the request. Details: ${error.message || 'Unknown error'}`);
    }
  }
);


'use server';
/**
 * @fileOverview An AI agent that gets weather information using a tool.
 *
 * - getWeatherInfo - A function that handles the weather query.
 * - GetWeatherInfoInput - The input type for the getWeatherInfo function.
 * - GetWeatherInfoOutput - The return type for the getWeatherInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const GetWeatherInfoInputSchema = z.object({
  lat: z.number().describe('The latitude for the location.'),
  lon: z.number().describe('The longitude for the location.'),
});
export type GetWeatherInfoInput = z.infer<typeof GetWeatherInfoInputSchema>;

const GetWeatherInfoOutputSchema = z.object({
  response: z.string().describe('A conversational response to the user about the weather.'),
});
export type GetWeatherInfoOutput = z.infer<typeof GetWeatherInfoOutputSchema>;


export async function getWeatherInfo(input: GetWeatherInfoInput): Promise<GetWeatherInfoOutput> {
  return weatherFlow(input);
}

const weatherTool = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Get the current weather and forecast for a given latitude and longitude.',
    inputSchema: z.object({ lat: z.number(), lon: z.number() }),
    outputSchema: z.string(),
  },
  async ({ lat, lon }) => {
    // Get the weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
     if (!weatherResponse.ok) {
        return JSON.stringify({ error: "Failed to fetch weather data" });
    }
    const weatherData = await weatherResponse.json();
    return JSON.stringify(weatherData);
  }
);

const weatherPrompt = ai.definePrompt(
  {
    name: 'weatherPrompt',
    input: { schema: GetWeatherInfoInputSchema },
    output: { schema: GetWeatherInfoOutputSchema },
    tools: [weatherTool],
    prompt: `You are a helpful AI assistant. Your user wants to know the weather for their current location.
  Use the provided tool to get the weather for the user's latitude and longitude.
  
  Provide a friendly, conversational response summarizing the current temperature, conditions (based on the weather_code), humidity, and wind speed. Also, provide a brief summary of the forecast for the next few days. Refer to the location as "your current location".

  Latitude: {{{lat}}}
  Longitude: {{{lon}}}
  `,
  },
);

const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: GetWeatherInfoInputSchema,
    outputSchema: GetWeatherInfoOutputSchema,
  },
  async (input) => {
    const { output } = await weatherPrompt(input);
    return output!;
  }
);
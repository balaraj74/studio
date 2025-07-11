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
  location: z.string().describe('The city and state, e.g. San Francisco, CA'),
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
    name: 'getWeather',
    description: 'Get the current weather in a given location',
    inputSchema: z.object({ location: z.string() }),
    outputSchema: z.string(),
  },
  async ({ location }) => {
    // First, get lat/lon for the location from a geocoding API
    const geocodeUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(location)}`;
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
        return JSON.stringify({ error: "Failed to geocode location" });
    }
    const geocodeData = await geocodeResponse.json() as any[];
    if (!geocodeData || geocodeData.length === 0) {
        return JSON.stringify({ error: "Could not find location" });
    }
    const { lat, lon } = geocodeData[0];

    // Then, get the weather from Open-Meteo
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
    prompt: `You are a helpful AI assistant. Your user wants to know the weather.
  Use the provided tool to get the weather for the user's location.
  
  Provide a friendly, conversational response summarizing the current temperature, conditions, humidity, and wind speed. Also, provide a brief summary of the forecast for the next few days.

  Location: {{{location}}}
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

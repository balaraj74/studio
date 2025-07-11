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

// Map WMO Weather interpretation codes to readable descriptions
const weatherCodeMap: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};


const weatherTool = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Get a summary of the current weather and a multi-day forecast for a given latitude and longitude.',
    inputSchema: z.object({ lat: z.number(), lon: z.number() }),
    outputSchema: z.string(),
  },
  async ({ lat, lon }) => {
    // Get the weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
     if (!weatherResponse.ok) {
        return "Failed to fetch weather data.";
    }
    const weatherData = await weatherResponse.json() as any;
    
    // Process the data into a human-readable summary string
    let summary = `Current weather: ${weatherData.current.temperature_2m}°C, ${weatherCodeMap[weatherData.current.weather_code] || 'Unknown conditions'}. Humidity is ${weatherData.current.relative_humidity_2m}% and wind speed is ${weatherData.current.wind_speed_10m} km/h.\n\n`;
    
    summary += "Forecast for the next few days:\n";
    
    weatherData.daily.time.slice(1, 6).forEach((time: string, index: number) => {
        const date = new Date(time).toLocaleDateString('en-US', { weekday: 'long' });
        const condition = weatherCodeMap[weatherData.daily.weather_code[index + 1]] || 'Unknown';
        const maxTemp = weatherData.daily.temperature_2m_max[index + 1];
        const minTemp = weatherData.daily.temperature_2m_min[index + 1];
        summary += `- ${date}: ${condition}, with a high of ${maxTemp}°C and a low of ${minTemp}°C.\n`;
    });

    return summary;
  }
);

const weatherPrompt = ai.definePrompt(
  {
    name: 'weatherPrompt',
    input: { schema: GetWeatherInfoInputSchema },
    output: { schema: GetWeatherInfoOutputSchema },
    tools: [weatherTool],
    prompt: `You are a helpful AI assistant. Your user wants to know the weather for their current location.
  
  1. Use the getCurrentWeather tool with the user's latitude and longitude.
  2. The tool will return a pre-formatted string summarizing the weather.
  3. Present this summary to the user in a friendly, conversational way. Just rephrase the summary slightly to be more natural. Refer to the location as "your current location".

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

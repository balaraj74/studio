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

const DailyForecastSchema = z.object({
    date: z.string().describe("The date for the forecast, e.g., 'Monday'."),
    weatherCode: z.number().describe("The WMO weather code."),
    maxTemp: z.number().describe("The maximum temperature."),
    minTemp: z.number().describe("The minimum temperature."),
});

const GetWeatherInfoOutputSchema = z.object({
  current: z.object({
    temperature: z.number(),
    weatherCode: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
  }),
  daily: z.array(DailyForecastSchema),
  summary: z.string().describe("A short, conversational summary of the overall weather."),
});
export type GetWeatherInfoOutput = z.infer<typeof GetWeatherInfoOutputSchema>;


export async function getWeatherInfo(input: GetWeatherInfoInput): Promise<GetWeatherInfoOutput> {
  return weatherFlow(input);
}

const weatherTool = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Get the current weather and a multi-day forecast for a given latitude and longitude.',
    inputSchema: GetWeatherInfoInputSchema,
    outputSchema: GetWeatherInfoOutputSchema,
  },
  async ({ lat, lon }) => {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
     if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
    }
    const weatherData = await weatherResponse.json() as any;

    const dailyForecasts = weatherData.daily.time.slice(1, 6).map((time: string, index: number) => ({
        date: new Date(time).toLocaleDateString('en-US', { weekday: 'long' }),
        weatherCode: weatherData.daily.weather_code[index + 1],
        maxTemp: Math.round(weatherData.daily.temperature_2m_max[index + 1]),
        minTemp: Math.round(weatherData.daily.temperature_2m_min[index + 1]),
    }));
    
    return {
        current: {
            temperature: Math.round(weatherData.current.temperature_2m),
            weatherCode: weatherData.current.weather_code,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
        },
        daily: dailyForecasts,
        summary: `It's currently ${Math.round(weatherData.current.temperature_2m)}°C. The forecast for the next few days looks varied.`
    };
  }
);

const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: GetWeatherInfoInputSchema,
    outputSchema: GetWeatherInfoOutputSchema,
  },
  async (input) => {
    // We can just call the tool directly to get structured data
    // This is faster and more reliable than asking the LLM
    const structuredData = await weatherTool(input);
    return structuredData;
  }
);

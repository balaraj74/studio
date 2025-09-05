
'use server';
/**
 * @fileOverview A Genkit flow to fetch driving directions from the Google Maps Directions API.
 *
 * - getDirections - A function that handles the directions query.
 * - DirectionsRequest - The input type for the getDirections function.
 * - DirectionsResponse - The return type for the getDirections function (conforms to google.maps.DirectionsResult).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const LatLngLiteralSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const DirectionsRequestSchema = z.object({
  origin: LatLngLiteralSchema,
  destination: LatLngLiteralSchema,
});
export type DirectionsRequest = z.infer<typeof DirectionsRequestSchema>;

// The response from the Google Maps Directions API is complex.
// We'll define it as z.any() and cast it on the client.
const DirectionsResponseSchema = z.any();
export type DirectionsResponse = z.infer<typeof DirectionsResponseSchema>;

export async function getDirections(input: DirectionsRequest): Promise<DirectionsResponse> {
  return getDirectionsFlow(input);
}

const getDirectionsFlow = ai.defineFlow(
  {
    name: 'getDirectionsFlow',
    inputSchema: DirectionsRequestSchema,
    outputSchema: DirectionsResponseSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured on the server.');
    }

    const { origin, destination } = input;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status !== 'OK') {
        throw new Error(`Failed to fetch directions: ${data.error_message || data.status}`);
      }

      // The response from the REST API is compatible with the JavaScript SDK's DirectionsResult interface.
      return data;
    } catch (error: any) {
      console.error('Error fetching directions from Google Maps API:', error);
      throw new Error('Could not retrieve route information. Please try again later.');
    }
  }
);

    
'use server';

/**
 * @fileOverview A breed description generation AI agent.
 *
 * - generateBreedDescription - A function that generates a breed description.
 * - GenerateBreedDescriptionInput - The input type for the generateBreedDescription function.
 * - GenerateBreedDescriptionOutput - The return type for the generateBreedDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBreedDescriptionInputSchema = z.object({
  breedName: z.string().describe('The name of the breed to generate a description for.'),
});
export type GenerateBreedDescriptionInput = z.infer<typeof GenerateBreedDescriptionInputSchema>;

const GenerateBreedDescriptionOutputSchema = z.object({
  description: z.string().describe('A concise description of the breed, covering origin, key traits, and milk yield.'),
});
export type GenerateBreedDescriptionOutput = z.infer<typeof GenerateBreedDescriptionOutputSchema>;

export async function generateBreedDescription(input: GenerateBreedDescriptionInput): Promise<GenerateBreedDescriptionOutput> {
  return generateBreedDescriptionFlow(input);
}

const breedDescriptionPrompt = ai.definePrompt({
  name: 'breedDescriptionPrompt',
  input: {schema: GenerateBreedDescriptionInputSchema},
  output: {schema: GenerateBreedDescriptionOutputSchema},
  prompt: `You are an expert in livestock breeds. Generate a concise description of the breed {{breedName}}, covering its origin, key traits, and milk yield.`,
});

const generateBreedDescriptionFlow = ai.defineFlow(
  {
    name: 'generateBreedDescriptionFlow',
    inputSchema: GenerateBreedDescriptionInputSchema,
    outputSchema: GenerateBreedDescriptionOutputSchema,
  },
  async input => {
    const {output} = await breedDescriptionPrompt(input);
    return output!;
  }
);

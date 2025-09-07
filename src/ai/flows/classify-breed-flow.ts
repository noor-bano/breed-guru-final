'use server';
/**
 * @fileOverview A breed classification AI agent.
 *
 * - classifyBreed - A function that handles the breed classification process.
 * - ClassifyBreedInput - The input type for the classifyBreed function.
 * - ClassifyBreedOutput - The return type for the classifyBreed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyBreedInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a cow or buffalo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ClassifyBreedInput = z.infer<typeof ClassifyBreedInputSchema>;

const PredictionSchema = z.object({
    breed: z.string().describe('The identified breed of the animal.'),
    confidence: z.number().describe('The confidence score of the prediction, from 0 to 1.'),
});

const ClassifyBreedOutputSchema = z.object({
    predictions: z.array(PredictionSchema).describe('A list of the top 3 breed predictions, sorted by confidence. If the image does not contain a cow or buffalo, return an empty array.'),
});
export type ClassifyBreedOutput = z.infer<typeof ClassifyBreedOutputSchema>;

export async function classifyBreed(input: ClassifyBreedInput): Promise<ClassifyBreedOutput> {
  return classifyBreedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyBreedPrompt',
  input: {schema: ClassifyBreedInputSchema},
  output: {schema: ClassifyBreedOutputSchema},
  prompt: `You are an expert in identifying breeds of cattle and buffalo from India.

Analyze the provided image and identify the breed of the animal. If the image does not contain a cow or a buffalo, you must return an empty predictions array.

Provide your top 3 predictions, ordered by confidence score (highest first). For each prediction, provide the breed name and a confidence score between 0 and 1.

Image: {{media url=photoDataUri}}`,
});

const classifyBreedFlow = ai.defineFlow(
  {
    name: 'classifyBreedFlow',
    inputSchema: ClassifyBreedInputSchema,
    outputSchema: ClassifyBreedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // Gracefully handle cases where the model returns no predictions or an invalid response.
    if (!output || !output.predictions) {
      return { predictions: [] };
    }
    
    // Sort predictions by confidence in descending order
    output.predictions.sort((a, b) => b.confidence - a.confidence);

    return output;
  }
);

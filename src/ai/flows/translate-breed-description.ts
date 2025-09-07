'use server';

/**
 * @fileOverview This file defines a Genkit flow for translating breed descriptions between English and Hindi.
 *
 * - translateBreedDescription - A function that translates the breed description.
 * - TranslateBreedDescriptionInput - The input type for the translateBreedDescription function.
 * - TranslateBreedDescriptionOutput - The return type for the translateBreedDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateBreedDescriptionInputSchema = z.object({
  text: z.string().describe('The breed description text to translate.'),
  targetLanguage: z.enum(['en', 'hi']).describe('The target language for translation (en: English, hi: Hindi).'),
});
export type TranslateBreedDescriptionInput = z.infer<typeof TranslateBreedDescriptionInputSchema>;

const TranslateBreedDescriptionOutputSchema = z.object({
  translatedText: z.string().describe('The translated breed description.'),
});
export type TranslateBreedDescriptionOutput = z.infer<typeof TranslateBreedDescriptionOutputSchema>;

export async function translateBreedDescription(
  input: TranslateBreedDescriptionInput
): Promise<TranslateBreedDescriptionOutput> {
  return translateBreedDescriptionFlow(input);
}

const translateBreedDescriptionPrompt = ai.definePrompt({
  name: 'translateBreedDescriptionPrompt',
  input: {
    schema: TranslateBreedDescriptionInputSchema,
  },
  output: {
    schema: TranslateBreedDescriptionOutputSchema,
  },
  prompt: `Translate the following text to {{targetLanguage}}:\n\n{{text}}`,
});

const translateBreedDescriptionFlow = ai.defineFlow(
  {
    name: 'translateBreedDescriptionFlow',
    inputSchema: TranslateBreedDescriptionInputSchema,
    outputSchema: TranslateBreedDescriptionOutputSchema,
  },
  async input => {
    const {output} = await translateBreedDescriptionPrompt(input);
    return output!;
  }
);

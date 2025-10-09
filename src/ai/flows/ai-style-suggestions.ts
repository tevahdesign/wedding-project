'use server';

/**
 * @fileOverview Provides AI-driven wedding style suggestions based on user preferences.
 *
 * - `getWeddingStyleSuggestions`: Asynchronously generates wedding style suggestions based on a quiz input.
 * - `WeddingStyleQuizInput`: The input type for the `getWeddingStyleSuggestions` function, representing the quiz answers.
 * - `WeddingStyleSuggestionOutput`: The output type for the `getWeddingStyleSuggestions` function, representing the AI's style suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeddingStyleQuizInputSchema = z.object({
  colorPreference: z.string().describe('Preferred color scheme for the wedding.'),
  themePreference: z.string().describe('Preferred wedding theme (e.g., rustic, modern, classic).'),
  locationPreference: z.string().describe('Preferred wedding location (e.g., beach, garden, ballroom).'),
  seasonPreference: z.string().describe('Preferred wedding season (e.g., spring, summer, fall, winter).'),
  budgetPreference: z.string().describe('Budget range for the wedding (e.g., budget-friendly, moderate, luxury).'),
});

export type WeddingStyleQuizInput = z.infer<typeof WeddingStyleQuizInputSchema>;

const WeddingStyleSuggestionOutputSchema = z.object({
  suggestedStyles: z.array(
    z.string().describe('Wedding styles that align with the user preferences.')
  ).describe('A list of wedding style suggestions'),
  reasoning: z.string().describe('Explanation of why these styles match the user preferences.'),
});

export type WeddingStyleSuggestionOutput = z.infer<typeof WeddingStyleSuggestionOutputSchema>;

export async function getWeddingStyleSuggestions(
  input: WeddingStyleQuizInput
): Promise<WeddingStyleSuggestionOutput> {
  return weddingStyleSuggestionsFlow(input);
}

const weddingStyleSuggestionsPrompt = ai.definePrompt({
  name: 'weddingStyleSuggestionsPrompt',
  input: {schema: WeddingStyleQuizInputSchema},
  output: {schema: WeddingStyleSuggestionOutputSchema},
  prompt: `Based on the following wedding preferences, suggest wedding styles that would be a good fit and explain your reasoning.\n\nColor Preference: {{{colorPreference}}}\nTheme Preference: {{{themePreference}}}\nLocation Preference: {{{locationPreference}}}\nSeason Preference: {{{seasonPreference}}}\nBudget Preference: {{{budgetPreference}}}\n\nRespond with a list of suggested wedding styles and a detailed explanation of why these styles align with the provided preferences. Enclose suggested styles in brackets.
`,
});

const weddingStyleSuggestionsFlow = ai.defineFlow(
  {
    name: 'weddingStyleSuggestionsFlow',
    inputSchema: WeddingStyleQuizInputSchema,
    outputSchema: WeddingStyleSuggestionOutputSchema,
  },
  async input => {
    const {output} = await weddingStyleSuggestionsPrompt(input);
    return output!;
  }
);

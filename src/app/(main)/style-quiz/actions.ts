"use server"

import {
  getWeddingStyleSuggestions,
  type WeddingStyleQuizInput,
  type WeddingStyleSuggestionOutput,
} from "@/ai/flows/ai-style-suggestions"
import { z } from "zod"

const QuizSchema = z.object({
  colorPreference: z.string().min(1, "Please select a color preference."),
  themePreference: z.string().min(1, "Please select a theme."),
  locationPreference: z.string().min(1, "Please select a location."),
  seasonPreference: z.string().min(1, "Please select a season."),
  budgetPreference: z.string().min(1, "Please select a budget."),
})

type QuizState = {
  suggestions: WeddingStyleSuggestionOutput | null;
  error?: string | null;
}

export async function submitQuiz(
  prevState: QuizState,
  formData: FormData
): Promise<QuizState> {
  try {
    const validatedFields = QuizSchema.safeParse({
      colorPreference: formData.get("colorPreference"),
      themePreference: formData.get("themePreference"),
      locationPreference: formData.get("locationPreference"),
      seasonPreference: formData.get("seasonPreference"),
      budgetPreference: formData.get("budgetPreference"),
    })

    if (!validatedFields.success) {
      return {
        suggestions: null,
        error: validatedFields.error.flatten().fieldErrors.toString(),
      }
    }

    const suggestions = await getWeddingStyleSuggestions(validatedFields.data as WeddingStyleQuizInput)

    return { suggestions, error: null }
  } catch (error) {
    console.error(error);
    return { suggestions: null, error: "An unexpected error occurred. Please try again." }
  }
}

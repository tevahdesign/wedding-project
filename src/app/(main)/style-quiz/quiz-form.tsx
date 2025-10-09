"use client"

import { useFormState, useFormStatus } from "react-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { submitQuiz } from "./actions"

const quizOptions = {
  colorPreference: ["Pastels (Blush, Mint)", "Bold & Vibrant (Ruby, Navy)", "Earthy Tones (Terracotta, Sage)", "Monochromatic (All White, Black & White)"],
  themePreference: ["Classic & Traditional", "Modern & Minimalist", "Rustic & Bohemian", "Romantic & Whimsical"],
  locationPreference: ["Indoor Ballroom", "Outdoor Garden / Park", "Beachside Resort", "Unique Venue (Museum, Loft)"],
  seasonPreference: ["Spring", "Summer", "Autumn", "Winter"],
  budgetPreference: ["Budget-Friendly ($)", "Moderate ($$)", "Luxury ($$$)"],
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Getting Suggestions...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Find My Style
        </>
      )}
    </Button>
  )
}

export function QuizForm() {
  const initialState = { suggestions: null, error: null }
  const [state, formAction] = useFormState(submitQuiz, initialState)

  if (state.suggestions) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Your Wedding Style Profile</CardTitle>
          <CardDescription>
            Based on your preferences, here are some styles we think you'll love.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Suggested Styles:</h3>
            <div className="flex flex-wrap gap-2">
              {state.suggestions.suggestedStyles.map((style) => (
                <div key={style} className="bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium">
                  {style}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Why you'll love these:</h3>
            <p className="text-muted-foreground whitespace-pre-line">{state.suggestions.reasoning}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
           <Button onClick={() => window.location.reload()} className="w-full">
            Start Over
          </Button>
          <p className="text-xs text-muted-foreground">This is an AI-generated suggestion. Use it as inspiration for your big day!</p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline">Find Your Perfect Wedding Style</CardTitle>
          <CardDescription>
            Answer a few questions and our AI will suggest styles tailored just for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="colorPreference">What's your color vibe?</Label>
              <Select name="colorPreference" required>
                <SelectTrigger id="colorPreference">
                  <SelectValue placeholder="Select a color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {quizOptions.colorPreference.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="themePreference">Pick a theme.</Label>
              <Select name="themePreference" required>
                <SelectTrigger id="themePreference">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {quizOptions.themePreference.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationPreference">Dream location?</Label>
            <Select name="locationPreference" required>
              <SelectTrigger id="locationPreference">
                <SelectValue placeholder="Select a location type" />
              </SelectTrigger>
              <SelectContent>
                {quizOptions.locationPreference.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="seasonPreference">Favorite season?</Label>
              <Select name="seasonPreference" required>
                <SelectTrigger id="seasonPreference">
                  <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent>
                  {quizOptions.seasonPreference.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPreference">What's your budget style?</Label>
              <Select name="budgetPreference" required>
                <SelectTrigger id="budgetPreference">
                  <SelectValue placeholder="Select a budget range" />
                </SelectTrigger>
                <SelectContent>
                  {quizOptions.budgetPreference.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}

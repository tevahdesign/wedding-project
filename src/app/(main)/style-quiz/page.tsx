import { PageHeader } from "@/components/app/page-header"
import { QuizForm } from "./quiz-form"

export default function StyleQuizPage() {
  return (
    <div className="flex flex-col items-center">
      <PageHeader
        title="AI Wedding Style Quiz"
        description="Discover your dream wedding aesthetic."
      />
      <QuizForm />
    </div>
  )
}

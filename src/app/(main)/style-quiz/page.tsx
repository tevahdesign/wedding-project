
import { PageHeader } from "@/components/app/page-header"
import { QuizForm } from "./quiz-form"

export default function StyleQuizPage() {
  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="AI Wedding Style Quiz"
        description="Discover your dream wedding aesthetic."
        showBackButton
      />
      <div className="p-4 pt-4">
        <QuizForm />
      </div>
    </div>
  )
}

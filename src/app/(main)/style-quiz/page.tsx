import { PageHeader } from "@/components/app/page-header"
import { QuizForm } from "./quiz-form"

export default function StyleQuizPage() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <PageHeader
        title="AI Wedding Style Quiz"
        description="Discover your dream wedding aesthetic."
      />
      <div className="p-4 pt-0">
        <QuizForm />
      </div>
    </div>
  )
}

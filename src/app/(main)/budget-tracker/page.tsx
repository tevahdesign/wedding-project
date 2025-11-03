
"use client"

import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlusCircle } from "lucide-react"
import { useMemo } from "react"
import { useAuth, useDatabase } from "@/firebase"
import { useList } from "@/firebase/database/use-list"
import { ref } from "firebase/database"

export default function BudgetTrackerPage() {
  const { user } = useAuth()
  const database = useDatabase()

  const budgetItemsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/budgetItems`)
  }, [user, database])

  const { data: budgetData, loading } = useList(budgetItemsRef)

  const { totalBudget, totalSpent } = useMemo(() => {
    if (!budgetData) return { totalBudget: 0, totalSpent: 0 }
    return budgetData.reduce(
      (acc, item) => {
        acc.totalBudget += item.budget || 0
        acc.totalSpent += item.spent || 0
        return acc
      },
      { totalBudget: 0, totalSpent: 0 }
    )
  }, [budgetData])

  const progressValue = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  
  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="Budget Tracker"
        description="Keep your wedding finances in order."
        showBackButton
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </PageHeader>
      <div className="p-4 pt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              {loading
                ? "Loading budget..."
                : `You've spent ₹${totalSpent.toLocaleString()} of your ₹${totalBudget.toLocaleString()} budget.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={progressValue}
              aria-label={`${progressValue}% of budget spent`}
            />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              ₹{(totalBudget - totalSpent).toLocaleString()} remaining.
            </p>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Your latest wedding expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {budgetData
                    ?.filter((c) => c.spent > 0)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          ₹{item.spent.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}

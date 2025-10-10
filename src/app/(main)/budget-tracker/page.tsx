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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"
import { useAuth, useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"

const chartConfig = {
  spent: { label: "Spent", color: "hsl(var(--primary))" },
  budget: { label: "Budget", color: "hsl(var(--secondary))" },
}

export default function BudgetTrackerPage() {
  const { user } = useAuth()
  const firestore = useFirestore()

  const budgetItemsRef = useMemo(() => {
    if (!user || !firestore) return null
    return collection(firestore, `users/${user.uid}/budgetItems`)
  }, [user, firestore])

  const { data: budgetData, loading } = useCollection(budgetItemsRef)

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
  const chartData =
    budgetData?.map((cat) => ({
      name: cat.name,
      spent: cat.spent,
      budget: cat.budget,
    })) || []

  return (
    <>
      <PageHeader
        title="Budget Tracker"
        description="Keep your wedding finances in order."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </PageHeader>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              {loading
                ? "Loading budget..."
                : `You've spent $${totalSpent.toLocaleString()} of your $${totalBudget.toLocaleString()} budget.`}
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
              ${(totalBudget - totalSpent).toLocaleString()} remaining.
            </p>
          </CardFooter>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `$${Number(value) / 1000}k`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="spent" fill="var(--color-spent)" radius={4} />
                    <Bar
                      dataKey="budget"
                      fill="var(--color-budget)"
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest wedding expenses.</CardDescription>
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
                          ${item.spent.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const budgetData = {
  totalBudget: 20000,
  totalSpent: 12500,
  categories: [
    { name: "Venue", spent: 5000, budget: 6000 },
    { name: "Catering", spent: 4000, budget: 5000 },
    { name: "Photography", spent: 2000, budget: 2500 },
    { name: "Attire", spent: 1500, budget: 2000 },
    { name: "Decor", spent: 0, budget: 1500 },
    { name: "Music", spent: 0, budget: 1000 },
  ],
}

const chartData = budgetData.categories.map(cat => ({ name: cat.name, spent: cat.spent, budget: cat.budget }));
const chartConfig = {
  spent: { label: "Spent", color: "hsl(var(--primary))" },
  budget: { label: "Budget", color: "hsl(var(--secondary))" },
}

export default function BudgetTrackerPage() {
  const progressValue = (budgetData.totalSpent / budgetData.totalBudget) * 100

  return (
    <>
      <PageHeader title="Budget Tracker" description="Keep your wedding finances in order.">
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
              You've spent ${budgetData.totalSpent.toLocaleString()} of your ${budgetData.totalBudget.toLocaleString()} budget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressValue} aria-label={`${progressValue}% of budget spent`} />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              ${(budgetData.totalBudget - budgetData.totalSpent).toLocaleString()} remaining.
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
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                     <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="spent" fill="var(--color-spent)" radius={4} />
                    <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
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
                  {budgetData.categories.filter(c => c.spent > 0).map((item) => (
                    <TableRow key={item.name}>
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

import { Card } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  )
}

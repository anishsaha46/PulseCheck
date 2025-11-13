"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/lib/hooks/use-analytics"
import { Activity, AlertCircle, Zap, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  timeRange: string
}

export function DashboardStats({ timeRange }: DashboardStatsProps) {
  const { data, isLoading, error } = useDashboardStats(timeRange)

  if (error) {
    return (
      <Card className="col-span-full bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load dashboard statistics</p>
        </CardContent>
      </Card>
    )
  }

  const stats = data?.data || {
    totalMonitors: 0,
    activeMonitors: 0,
    totalChecks: 0,
    avgLatency: 0,
    uptime: 0,
    openIncidents: 0,
  }

  const StatCard = ({ icon: Icon, label, value, unit }: any) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary opacity-70" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Activity}
        label="Active Monitors"
        value={stats.activeMonitors}
        unit={`of ${stats.totalMonitors}`}
      />
      <StatCard icon={TrendingUp} label="Avg Latency" value={Math.round(stats.avgLatency)} unit="ms" />
      <StatCard icon={Zap} label="Total Checks" value={stats.totalChecks.toLocaleString()} />
      <StatCard icon={AlertCircle} label="Open Incidents" value={stats.openIncidents} />
    </div>
  )
}

"use client"

import Link from "next/link"
import { useMonitors } from "@/lib/hooks/use-monitors"
import { useRunMonitorCheck } from "@/lib/hooks/use-monitors"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Circle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { handleApiError } from "@/lib/utils/error-handler"

export function MonitorStatusGrid() {
  const { data, isLoading, error } = useMonitors()
  const runCheckMutation = useRunMonitorCheck()

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load monitors</p>
        </CardContent>
      </Card>
    )
  }

  const monitors = data?.data || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "up":
        return "bg-accent text-accent-foreground"
      case "down":
        return "bg-destructive text-destructive-foreground"
      case "timeout":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleRunCheck = async (monitorId: string) => {
    try {
      await runCheckMutation.mutateAsync(monitorId)
      toast.success("Check triggered successfully")
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Monitor Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitors.map((monitor: any) => (
          <Link key={monitor.id} href={`/dashboard/monitors/${monitor.id}`} className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-sm group-hover:border-primary/20">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{monitor.name}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate mt-1">{monitor.url}</p>
                </div>
                <Badge className={getStatusColor(monitor.lastStatus)}>
                  <Circle className="h-2 w-2 mr-1 fill-current" />
                  {monitor.lastStatus || "unknown"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Interval</p>
                    <p className="font-medium">{monitor.intervalSec}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Timeout</p>
                    <p className="font-medium">{monitor.timeoutMs}ms</p>
                  </div>
                </div>
                {monitor.lastCheckAt && (
                  <p className="text-xs text-muted-foreground">
                    Last check {formatDistanceToNow(new Date(monitor.lastCheckAt), { addSuffix: true })}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRunCheck(monitor.id)
                  }}
                  disabled={runCheckMutation.isPending}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Run Check
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useIncidents } from "@/lib/hooks/use-analytics"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function RecentIncidents() {
  const { data, isLoading, error } = useIncidents(5)

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load incidents</p>
        </CardContent>
      </Card>
    )
  }

  const incidents = data?.data || []

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Recent Incidents
        </CardTitle>
        <CardDescription>Latest incident activity</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No recent incidents</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident:any) => (
              <Link
                key={incident.id}
                href={`/dashboard/incidents/${incident.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{incident.monitor?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Started {formatDistanceToNow(new Date(incident.startAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {incident.status === "resolved" ? (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      Resolved
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Open</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        {incidents.length > 0 && (
          <Link href="/dashboard/incidents">
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Incidents
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

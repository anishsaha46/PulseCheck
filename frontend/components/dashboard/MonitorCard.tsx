"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Monitor {
  id: string
  name: string
  url: string
  status: string
}

export function MonitorCard({ monitor }: { monitor: Monitor }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold">{monitor.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{monitor.url}</p>
        </div>
        <Badge variant={monitor.status === "up" ? "default" : "destructive"}>{monitor.status}</Badge>
      </div>
      <div className="flex gap-2">
        <Link href={`/dashboard/monitors/${monitor.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Details
          </Button>
        </Link>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
    </Card>
  )
}

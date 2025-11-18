"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground mt-2">Manage your alert notifications</p>
        </div>
        <Button>Create Alert</Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : alerts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No alerts configured yet</p>
          <Button>Create your first alert</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{alert.type}</p>
                <p className="text-sm text-muted-foreground">{alert.recipient}</p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

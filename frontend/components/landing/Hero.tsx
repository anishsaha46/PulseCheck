"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="min-h-screen bg-linear-to-b from-background to-muted flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Monitor Your APIs in Real-Time</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track latency, uptime, and performance across all your API endpoints. Get instant alerts when issues occur.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

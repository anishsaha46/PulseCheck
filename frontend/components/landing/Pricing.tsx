"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function Pricing() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Starter", price: "$29", monitors: "5" },
            { name: "Professional", price: "$99", monitors: "50", popular: true },
            { name: "Enterprise", price: "Custom", monitors: "Unlimited" },
          ].map((plan) => (
            <Card key={plan.name} className={`p-8 ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <p className="text-muted-foreground mb-6">{plan.monitors} monitors</p>
              <Link href="/register">
                <Button className="w-full">{plan.popular ? "Get Started" : "Choose"}</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

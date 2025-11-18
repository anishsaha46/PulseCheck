"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Starter", price: "$29", monitors: "5", checks: "1,000" },
              { name: "Professional", price: "$99", monitors: "50", checks: "50,000", popular: true },
              { name: "Enterprise", price: "Custom", monitors: "Unlimited", checks: "Unlimited" },
            ].map((plan) => (
              <Card key={plan.name} className={`p-8 ${plan.popular ? "ring-2 ring-primary" : ""}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    {plan.monitors} monitors
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    {plan.checks} checks/month
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Email alerts
                  </li>
                </ul>
                <Button className="w-full">{plan.popular ? "Get Started" : "Choose Plan"}</Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

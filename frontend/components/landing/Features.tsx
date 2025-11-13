export function Features() {
  const features = [
    { title: "Real-Time Monitoring", description: "Monitor your APIs every minute" },
    { title: "Instant Alerts", description: "Get notified immediately when issues occur" },
    { title: "Detailed Analytics", description: "View comprehensive performance metrics" },
    { title: "Easy Integration", description: "Set up monitoring in seconds" },
    { title: "Global Coverage", description: "Monitor from multiple locations" },
    { title: "99.9% Uptime SLA", description: "Reliable monitoring infrastructure" },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose API Monitor?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "12:00", latency: 120 },
  { time: "12:15", latency: 140 },
  { time: "12:30", latency: 130 },
  { time: "12:45", latency: 150 },
  { time: "13:00", latency: 145 },
  { time: "13:15", latency: 160 },
]

export function LatencyChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="latency" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  )
}

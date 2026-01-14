"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CardContainer } from "@/components/card-container"

interface CandidateResult {
  id: string
  name: string
  party: string
  partySymbol: string
  votes: number
  percentage: number
}

export default function ResultsPage() {
  const [selectedState, setSelectedState] = useState("Maharashtra")
  const [selectedDistrict, setSelectedDistrict] = useState("Mumbai South")
  const [selectedWard, setSelectedWard] = useState("Ward 45")

  const results: CandidateResult[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      party: "National Progressive Party",
      partySymbol: "🌾",
      votes: 45230,
      percentage: 32.5,
    },
    {
      id: "2",
      name: "Priya Sharma",
      party: "Democratic Alliance",
      partySymbol: "🏛️",
      votes: 38950,
      percentage: 28.1,
    },
    {
      id: "3",
      name: "Arjun Singh",
      party: "People's United Front",
      partySymbol: "⭐",
      votes: 35670,
      percentage: 25.7,
    },
    {
      id: "4",
      name: "Meera Patel",
      party: "Inclusive Growth Movement",
      partySymbol: "🤝",
      votes: 19210,
      percentage: 13.8,
    },
  ]

  const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh"]
  const districts = ["Mumbai South", "Mumbai North", "Thane", "Pune"]
  const wards = ["Ward 45", "Ward 46", "Ward 47", "Ward 48"]

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0)
  const maxVotes = Math.max(...results.map((r) => r.votes))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Live Election Results</h1>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-accent rounded-full animate-pulse"></span>
              <p className="text-sm text-muted-foreground">Real-time results - Last updated 2 minutes ago</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Ward</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <CardContainer className="mb-8 bg-secondary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">TOTAL VOTES CAST</p>
                <p className="text-4xl font-bold text-foreground">{totalVotes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">VOTING PERCENTAGE</p>
                <p className="text-4xl font-bold text-primary">68.4%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">STATUS</p>
                <p className="text-lg font-semibold text-accent">In Progress</p>
              </div>
            </div>
          </CardContainer>

          {/* Results Table and Charts */}
          <div className="space-y-8">
            {results.map((result, index) => (
              <div key={result.id}>
                <div className="flex items-end gap-4 mb-2">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
                    {result.partySymbol}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{result.name}</h3>
                    <p className="text-sm text-primary font-semibold">{result.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">{result.votes.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{result.percentage}%</p>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-secondary rounded-lg p-4 overflow-hidden">
                  <div className="flex items-center gap-3 h-8">
                    <div
                      className="bg-gradient-to-r from-primary to-accent rounded h-full transition-all duration-500"
                      style={{ width: `${(result.votes / maxVotes) * 100}%` }}
                    ></div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {result.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transparency Notice */}
          <CardContainer className="mt-12 bg-accent/10 border-2 border-accent">
            <div className="flex gap-4">
              <div className="text-2xl flex-shrink-0">📋</div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Election Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  All results are recorded on the secure blockchain network. Each vote is verifiable without
                  compromising voter anonymity. This ensures complete transparency and prevents any unauthorized
                  modifications to the results.
                </p>
              </div>
            </div>
          </CardContainer>
        </div>
      </main>

      <Footer />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CardContainer } from "@/components/card-container"

interface Candidate {
  id: string
  name: string
  party: string
  partySymbol: string
  education: string
  workSummary: string
  additionalInfo: string
  state: string
  district: string
  ward: string
}

export default function CandidatesPage() {
  const [selectedState, setSelectedState] = useState("Maharashtra")
  const [selectedDistrict, setSelectedDistrict] = useState("Mumbai South")
  const [selectedWard, setSelectedWard] = useState("Ward 45")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const candidates: Candidate[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      party: "National Progressive Party",
      partySymbol: "🌾",
      education: "B.A., M.A. Political Science from Delhi University",
      workSummary: "20 years of experience in public administration and social welfare programs",
      additionalInfo:
        "Rajesh Kumar has successfully led multiple infrastructure development projects, housing schemes for underprivileged citizens, and education initiatives across the district.",
      state: "Maharashtra",
      district: "Mumbai South",
      ward: "Ward 45",
    },
    {
      id: "2",
      name: "Priya Sharma",
      party: "Democratic Alliance",
      partySymbol: "🏛️",
      education: "B.Tech IIT Mumbai, MBA from XLRI",
      workSummary: "15 years in education and infrastructure development",
      additionalInfo:
        "Priya has established tech parks, skill development centers, and has worked extensively on digital literacy programs benefiting thousands of citizens.",
      state: "Maharashtra",
      district: "Mumbai South",
      ward: "Ward 45",
    },
    {
      id: "3",
      name: "Arjun Singh",
      party: "People's United Front",
      partySymbol: "⭐",
      education: "B.Sc, M.Sc Environmental Science from JNU",
      workSummary: "12 years focused on environmental protection and sustainable development",
      additionalInfo:
        "Arjun has led several green initiatives, water conservation projects, and has been instrumental in reducing pollution levels in urban areas.",
      state: "Maharashtra",
      district: "Mumbai South",
      ward: "Ward 45",
    },
    {
      id: "4",
      name: "Meera Patel",
      party: "Inclusive Growth Movement",
      partySymbol: "🤝",
      education: "B.Com, M.Com Economics from Mumbai University",
      workSummary: "18 years in economic development and poverty alleviation programs",
      additionalInfo:
        "Meera has implemented microfinance schemes, women entrepreneurship programs, and has focused on creating sustainable employment opportunities.",
      state: "Maharashtra",
      district: "Mumbai South",
      ward: "Ward 45",
    },
  ]

  const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh"]
  const districts = ["Mumbai South", "Mumbai North", "Thane", "Pune"]
  const wards = ["Ward 45", "Ward 46", "Ward 47", "Ward 48"]

  const filteredCandidates = candidates.filter(
    (c) => c.state === selectedState && c.district === selectedDistrict && c.ward === selectedWard,
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Candidates</h1>
          <p className="text-muted-foreground mb-8">Learn about all candidates standing for election in your area</p>

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

          {/* Candidates List */}
          <div className="space-y-6">
            {filteredCandidates.map((candidate) => (
              <CardContainer
                key={candidate.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl">
                      {candidate.partySymbol}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-1">{candidate.name}</h3>
                    <p className="text-primary font-semibold mb-3">{candidate.party}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">EDUCATION</p>
                        <p className="text-sm text-foreground">{candidate.education}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">WORK SUMMARY</p>
                        <p className="text-sm text-foreground">{candidate.workSummary}</p>
                      </div>
                    </div>

                    {expandedId === candidate.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground font-medium mb-2">ADDITIONAL INFORMATION</p>
                        <p className="text-sm text-foreground leading-relaxed">{candidate.additionalInfo}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {expandedId === candidate.id ? "Click to collapse" : "Click to expand"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContainer>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

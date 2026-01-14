"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
}

export default function VotingPage() {
  const navigate = useNavigate()
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [voteCast, setVoteCast] = useState(false)

  // Mock candidate data
  const candidates: Candidate[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      party: "National Progressive Party",
      partySymbol: "🌾",
      education: "B.A., M.A. Political Science",
      workSummary: "20 years of experience in public administration and social welfare programs",
    },
    {
      id: "2",
      name: "Priya Sharma",
      party: "Democratic Alliance",
      partySymbol: "🏛️",
      education: "B.Tech, MBA",
      workSummary: "15 years in education and infrastructure development",
    },
    {
      id: "3",
      name: "Arjun Singh",
      party: "People's United Front",
      partySymbol: "⭐",
      education: "B.Sc, M.Sc Environmental Science",
      workSummary: "12 years focused on environmental protection and sustainable development",
    },
    {
      id: "4",
      name: "Meera Patel",
      party: "Inclusive Growth Movement",
      partySymbol: "🤝",
      education: "B.Com, M.Com Economics",
      workSummary: "18 years in economic development and poverty alleviation programs",
    },
  ]

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId)

  const handleCastVote = () => {
    setVoteCast(true)
    setTimeout(() => {
      navigate("/success")
    }, 2000)
  }

  if (voteCast) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header showNav={false} />
        <main className="flex-1 flex items-center justify-center py-12">
          <CardContainer className="text-center max-w-md">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Vote Cast Successfully!</h2>
            <p className="text-muted-foreground mb-6">Your vote has been securely recorded and locked.</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </CardContainer>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={false} />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Voting Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Cast Your Vote</h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-muted-foreground text-xs mb-1">State</p>
                  <p className="font-semibold text-foreground">Maharashtra</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-muted-foreground text-xs mb-1">District</p>
                  <p className="font-semibold text-foreground">Mumbai South</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-muted-foreground text-xs mb-1">Ward</p>
                  <p className="font-semibold text-foreground">Ward 45</p>
                </div>
              </div>
              <div className="bg-accent/10 border border-accent rounded-lg p-4">
                <p className="text-xs text-accent font-medium">VOTER VERIFIED ✓</p>
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidateId(candidate.id)}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCandidateId === candidate.id
                    ? "ring-2 ring-primary ring-offset-2 scale-105"
                    : "hover:shadow-lg"
                }`}
              >
                <CardContainer className={`${selectedCandidateId === candidate.id ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start gap-4">
                    {/* Candidate Avatar and Selection */}
                    <div className="relative">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                        {candidate.partySymbol}
                      </div>
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate.id}
                        checked={selectedCandidateId === candidate.id}
                        onChange={(e) => setSelectedCandidateId(e.target.value)}
                        className="absolute -bottom-2 -right-2 h-6 w-6 cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
                      <p className="text-sm text-primary font-semibold mb-2">{candidate.party}</p>
                      <p className="text-xs text-muted-foreground mb-3">{candidate.education}</p>
                      <p className="text-sm text-foreground">{candidate.workSummary}</p>
                    </div>
                  </div>
                </CardContainer>
              </div>
            ))}
          </div>

          {/* Cast Vote Section */}
          {selectedCandidate && (
            <div className="max-w-2xl mx-auto">
              <CardContainer className="bg-accent/5 border-2 border-accent">
                <h2 className="text-xl font-bold text-foreground mb-4">You Selected:</h2>
                <div className="bg-background rounded-lg p-6 mb-6 border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl">
                      {selectedCandidate.partySymbol}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedCandidate.name}</h3>
                      <p className="text-primary font-semibold">{selectedCandidate.party}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Once you confirm, your vote will be encrypted, locked, and cannot be changed. Your vote will be
                  completely anonymous and will contribute to the transparent election results.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Confirm & Cast Vote
                  </button>
                  <button
                    onClick={() => setSelectedCandidateId(null)}
                    className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-muted transition-colors border border-border"
                  >
                    Change Selection
                  </button>
                </div>
              </CardContainer>
            </div>
          )}

          {!selectedCandidate && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Select a candidate above to continue</p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CardContainer className="max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-4">Confirm Your Vote</h2>
            <p className="text-muted-foreground mb-4">
              You are about to cast your vote for{" "}
              <span className="font-bold text-foreground">{selectedCandidate?.name}</span>. This action cannot be
              undone.
            </p>

            <div className="bg-secondary rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground">Your vote will be:</p>
              <ul className="text-sm text-foreground mt-2 space-y-1">
                <li>✓ Encrypted using blockchain</li>
                <li>✓ Completely anonymous</li>
                <li>✓ Permanently locked</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleCastVote()}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Yes, Cast Vote
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-muted transition-colors border border-border"
              >
                Cancel
              </button>
            </div>
          </CardContainer>
        </div>
      )}

      <Footer />
    </div>
  )
}
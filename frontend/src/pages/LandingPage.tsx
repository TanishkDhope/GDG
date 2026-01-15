"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ButtonGroup } from "@/components/Button-Group"
import { CardContainer } from "@/components/Card-Container"

export default function Home() {
  const navigate = useNavigate()
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  // Check registration status on component mount
  useEffect(() => {
    const checkRegistrationStatus = () => {
      // Check if voter credentials exist in localStorage
      const registered = localStorage.getItem('voterRegistered') === 'true'
      setIsRegistered(registered)
    }

    checkRegistrationStatus()

    // Optional: Listen for storage changes (if user opens multiple tabs)
    window.addEventListener('storage', checkRegistrationStatus)
    
    return () => {
      window.removeEventListener('storage', checkRegistrationStatus)
    }
  }, [])

  const features = [
    {
      id: "secure",
      title: "Secure & Anonymous",
      description: "Your vote is encrypted and completely anonymous using blockchain technology",
      icon: "🔒",
    },
    {
      id: "transparent",
      title: "Transparent",
      description: "Real-time results and complete transparency in the voting process",
      icon: "👁️",
    },
    {
      id: "accessible",
      title: "Accessible",
      description: "Easy-to-use interface designed for all citizens with multi-language support",
      icon: "♿",
    },
    {
      id: "verified",
      title: "Verified",
      description: "Advanced face and OTP verification ensures secure voter authentication",
      icon: "✓",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Project BALLOT</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Secure, Anonymous, and Transparent Blockchain-Based Voting System
              </p>
              <p className="text-base text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Experience the future of democratic elections. Project BALLOT uses cutting-edge blockchain technology to
                ensure your vote is secure, your identity is protected, and the results are completely transparent.
              </p>

              <ButtonGroup layout="horizontal" className="justify-center">
                <button
                  onClick={() => navigate("/verify")}
                  disabled={isRegistered}
                  className={`px-8 py-3 font-semibold rounded-lg transition-colors shadow-md ${
                    isRegistered
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  title={isRegistered ? "Already registered" : "Register to vote"}
                >
                  Register to Vote
                </button>
                <button
                  onClick={() => navigate("/voting")}
                  disabled={!isRegistered}
                  className={`px-8 py-3 font-semibold rounded-lg transition-colors shadow-md ${
                    !isRegistered
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  title={!isRegistered ? "Please register first" : "Cast your vote"}
                >
                  Vote Now
                </button>
                <button
                  onClick={() => navigate("/candidates")}
                  className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  View Candidates
                </button>
                <button
                  onClick={() => navigate("/results")}
                  className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  View Results
                </button>
              </ButtonGroup>

              {/* Registration Status Indicator */}
              {isRegistered && (
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    ✓ You are registered and can vote
                  </span>
                </div>
              )}
              {!isRegistered && (
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    ℹ Please register first to cast your vote
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Why Choose BALLOT?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <CardContainer
                  key={feature.id}
                  className={`transition-all duration-300 cursor-default ${
                    hoveredFeature === feature.id ? "shadow-lg ring-2 ring-primary/50" : ""
                  }`}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContainer>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  number: "1",
                  title: "Voter ID Verification",
                  description: "Enter your voter ID to begin the secure voting process",
                },
                {
                  number: "2",
                  title: "Face Verification",
                  description: "Complete biometric verification using facial recognition",
                },
                {
                  number: "3",
                  title: "OTP Confirmation",
                  description: "Verify your mobile number with a one-time password",
                },
                {
                  number: "4",
                  title: "Cast Your Vote",
                  description: "Select your candidate and securely submit your vote",
                },
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-background rounded-lg border border-border p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border transform -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Information Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Important Information</h2>

            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal information is encrypted and stored securely. Your vote is completely anonymous and
                  cannot be traced back to you. We use military-grade encryption and blockchain technology to protect
                  your data.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Eligibility Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  You must be an Indian citizen, at least 18 years old, and registered as a voter in the election
                  commission database to participate in this election.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Election Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  All voting records are logged on a secure blockchain network. You can verify your vote was recorded
                  correctly without compromising your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
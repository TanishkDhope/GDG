"use client"

import { FormEvent } from "react"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CardContainer } from "@/components/Card-Container"

interface Complaint {
  id: string
  voterId: string
  category: string
  description: string
  status: "submitted" | "under-review" | "resolved"
  submittedAt: string
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<"faq" | "complaint">("faq")
  const [voterId, setVoterId] = useState("")
  const [category, setCategory] = useState("technical")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "1",
      voterId: "ABC1234567",
      category: "face-verification",
      description: "Face verification failed multiple times",
      status: "under-review",
      submittedAt: "2025-01-12",
    },
    {
      id: "2",
      voterId: "XYZ9876543",
      category: "otp",
      description: "Did not receive OTP on registered mobile number",
      status: "resolved",
      submittedAt: "2025-01-11",
    },
  ])

  const faqs = [
    {
      question: "How do I register to vote?",
      answer:
        "You can register to vote on the Election Commission website or through authorized centers. You need to be an Indian citizen, at least 18 years old, and a resident of your constituency.",
    },
    {
      question: "Is my vote really anonymous?",
      answer:
        "Yes, your vote is completely anonymous. We use blockchain technology and encryption to ensure that your vote cannot be traced back to you. Your personal data is kept separate from your vote.",
    },
    {
      question: "What should I do if face verification fails?",
      answer:
        "Ensure your image is clear, well-lit, and shows your face directly. Remove glasses if possible and avoid shadows. You can try multiple times or contact help support if the issue persists.",
    },
    {
      question: "What if I don't receive the OTP?",
      answer:
        "Check your spam folder first. Ensure your mobile number is registered with the Election Commission. If you still don't receive it, use the resend option after 2 minutes or contact support.",
    },
    {
      question: "Can I change my vote after casting it?",
      answer:
        "No, once you cast your vote, it is locked on the blockchain and cannot be changed. This ensures the integrity of the election.",
    },
    {
      question: "How can I verify my vote was recorded correctly?",
      answer:
        "After voting, you receive a confirmation. You can verify your vote on the blockchain using your voter ID without compromising your anonymity.",
    },
  ]

  const handleSubmitComplaint = (e: FormEvent) => {
    e.preventDefault()
    if (!voterId.trim() || !description.trim()) {
      alert("Please fill in all fields")
      return
    }

    const newComplaint: Complaint = {
      id: Math.random().toString(),
      voterId,
      category,
      description,
      status: "submitted",
      submittedAt: new Date().toISOString().split("T")[0],
    }

    setComplaints([newComplaint, ...complaints])
    setVoterId("")
    setCategory("technical")
    setDescription("")
    setSubmitted(true)

    setTimeout(() => {
      setSubmitted(false)
    }, 5000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "under-review":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return "📝"
      case "under-review":
        return "🔍"
      case "resolved":
        return "✓"
      default:
        return "•"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Help & Support</h1>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "faq"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab("complaint")}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "complaint"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Report Issue
            </button>
          </div>

          {/* FAQ Section */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <CardContainer key={index}>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContainer>
              ))}
            </div>
          )}

          {/* Complaint Section */}
          {activeTab === "complaint" && (
            <div className="space-y-8">
              {/* Submit Complaint Form */}
              <CardContainer>
                <h2 className="text-2xl font-bold text-foreground mb-6">Report a Voting Issue</h2>

                {submitted && (
                  <div className="mb-6 bg-green-50 border border-green-300 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">✓ Complaint submitted successfully!</p>
                    <p className="text-green-700 text-sm">We will review your issue and contact you soon.</p>
                  </div>
                )}

                <form onSubmit={handleSubmitComplaint} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Voter ID</label>
                    <input
                      type="text"
                      value={voterId}
                      onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                      placeholder="e.g., ABC1234567"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="face-verification">Face Verification Problem</option>
                      <option value="otp">OTP Issue</option>
                      <option value="voter-id">Voter ID Issue</option>
                      <option value="voting-process">Voting Process Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe the issue you encountered..."
                      rows={5}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Submit Complaint
                  </button>
                </form>
              </CardContainer>

              {/* Submitted Complaints */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Complaints</h2>
                <div className="space-y-4">
                  {complaints.length === 0 ? (
                    <CardContainer>
                      <p className="text-muted-foreground text-center py-8">No complaints submitted yet</p>
                    </CardContainer>
                  ) : (
                    complaints.map((complaint) => (
                      <CardContainer key={complaint.id}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{complaint.category}</h3>
                            <p className="text-sm text-muted-foreground">Submitted on {complaint.submittedAt}</p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              complaint.status,
                            )}`}
                          >
                            {getStatusIcon(complaint.status)} {complaint.status}
                          </span>
                        </div>
                        <p className="text-foreground">{complaint.description}</p>
                      </CardContainer>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { CardContainer } from "@/components/Card-Container"

interface Complaint {
  id: string
  voterId: string
  category: string
  description: string
  status: "submitted" | "under-review" | "resolved"
  submittedAt: string
}

export default function AdminPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "under-review" | "resolved">("all")

  const complaints: Complaint[] = [
    {
      id: "1",
      voterId: "ABC1234567",
      category: "face-verification",
      description: "Face verification failed multiple times even with clear image",
      status: "under-review",
      submittedAt: "2025-01-12",
    },
    {
      id: "2",
      voterId: "XYZ9876543",
      category: "otp",
      description: "Did not receive OTP on registered mobile number for 10 minutes",
      status: "resolved",
      submittedAt: "2025-01-11",
    },
    {
      id: "3",
      voterId: "PQR5555555",
      category: "technical",
      description: "Website became unresponsive during voting process",
      status: "submitted",
      submittedAt: "2025-01-13",
    },
    {
      id: "4",
      voterId: "MNO7777777",
      category: "voter-id",
      description: "Voter ID not recognized in the system",
      status: "under-review",
      submittedAt: "2025-01-12",
    },
    {
      id: "5",
      voterId: "JKL4444444",
      category: "voting-process",
      description: "Confirmation modal disappeared before submission",
      status: "resolved",
      submittedAt: "2025-01-10",
    },
  ]

  const filteredComplaints = filterStatus === "all" ? complaints : complaints.filter((c) => c.status === filterStatus)

  const stats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    underReview: complaints.filter((c) => c.status === "under-review").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }

  const electionStats = {
    totalVoters: 150000,
    votedVoters: 102450,
    totalVotes: 102450,
    votingPercentage: 68.3,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "under-review":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <Header showNav={false} />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Read-only election monitoring and complaint management</p>
          </div>

          {/* Election Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardContainer className="bg-gradient-to-br from-primary/5 to-primary/10">
              <p className="text-xs font-medium text-muted-foreground mb-2">TOTAL REGISTERED VOTERS</p>
              <p className="text-3xl font-bold text-foreground">{electionStats.totalVoters.toLocaleString()}</p>
            </CardContainer>

            <CardContainer className="bg-gradient-to-br from-accent/5 to-accent/10">
              <p className="text-xs font-medium text-muted-foreground mb-2">VOTES CAST</p>
              <p className="text-3xl font-bold text-foreground">{electionStats.totalVotes.toLocaleString()}</p>
            </CardContainer>

            <CardContainer>
              <p className="text-xs font-medium text-muted-foreground mb-2">VOTING PERCENTAGE</p>
              <p className="text-3xl font-bold text-primary">{electionStats.votingPercentage.toFixed(1)}%</p>
            </CardContainer>

            <CardContainer>
              <p className="text-xs font-medium text-muted-foreground mb-2">STATUS</p>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 bg-accent rounded-full animate-pulse"></span>
                <p className="text-lg font-semibold text-foreground">Live</p>
              </div>
            </CardContainer>
          </div>

          {/* Complaint Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <CardContainer>
              <p className="text-xs text-muted-foreground font-medium mb-2">TOTAL COMPLAINTS</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContainer>
            <CardContainer className="border-blue-300 bg-blue-50">
              <p className="text-xs text-blue-700 font-medium mb-2">SUBMITTED</p>
              <p className="text-2xl font-bold text-blue-900">{stats.submitted}</p>
            </CardContainer>
            <CardContainer className="border-yellow-300 bg-yellow-50">
              <p className="text-xs text-yellow-700 font-medium mb-2">UNDER REVIEW</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.underReview}</p>
            </CardContainer>
            <CardContainer className="border-green-300 bg-green-50">
              <p className="text-xs text-green-700 font-medium mb-2">RESOLVED</p>
              <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
            </CardContainer>
          </div>

          {/* Complaints Management */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Complaint Management</h2>
              <div className="flex gap-2 flex-wrap">
                {(["all", "submitted", "under-review", "resolved"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <CardContainer key={complaint.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}
                        >
                          {getStatusIcon(complaint.status)} {complaint.status}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">{complaint.submittedAt}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {complaint.category.replace("-", " ").charAt(0).toUpperCase() +
                          complaint.category.replace("-", " ").slice(1)}
                      </h3>
                      <p className="text-sm text-foreground mb-2">{complaint.description}</p>
                      <p className="text-xs text-muted-foreground">Voter ID: {complaint.voterId}</p>
                    </div>
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium border border-border">
                      View Details
                    </button>
                  </div>
                </CardContainer>
              ))}

              {filteredComplaints.length === 0 && (
                <CardContainer className="text-center py-8">
                  <p className="text-muted-foreground">No complaints with this status</p>
                </CardContainer>
              )}
            </div>
          </div>

          {/* Transparency Notice */}
          <CardContainer className="mt-12 bg-accent/10 border-2 border-accent">
            <div className="flex gap-4">
              <div className="text-2xl flex-shrink-0">🔐</div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Admin Panel Security Notice</h3>
                <p className="text-sm text-muted-foreground">
                  This admin panel is read-only for transparency purposes. No votes can be modified, deleted, or edited.
                  All actions are logged and auditable. This ensures the integrity and security of the entire voting
                  system.
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

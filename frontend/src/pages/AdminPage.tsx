"use client"

import { useState, useEffect } from "react"
import { Footer } from "@/components/Footer"
import { AdminNavbar } from "@/components/AdminNavbar"
import { CardContainer } from "@/components/Card-Container"
import axios from "axios"
import { Loader2, X, MessageSquare, RefreshCw } from "lucide-react"

const API_BASE = "gdg-backend-hfnlry93o-tanishks-projects-9d31ddd5.vercel.app:8000/api/v1"

interface Complaint {
  _id: string
  voterId: string
  category: string
  description: string
  status: "submitted" | "under-review" | "resolved"
  adminResponse: string
  createdAt: string
  resolvedAt: string | null
}

interface ComplaintStats {
  total: number
  submitted: number
  underReview: number
  resolved: number
}

export default function AdminPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "under-review" | "resolved">("all")
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats>({ total: 0, submitted: 0, underReview: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state for updating complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [adminResponse, setAdminResponse] = useState<string>("")
  const [updating, setUpdating] = useState(false)

  const fetchComplaints = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE}/complaints`, { withCredentials: true })
      if (response.data.success) {
        setComplaints(response.data.data.complaints)
        setStats(response.data.data.stats)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch complaints. Make sure you are logged in as admin.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const filteredComplaints = filterStatus === "all" 
    ? complaints 
    : complaints.filter((c) => c.status === filterStatus)

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

  const openUpdateModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setNewStatus(complaint.status)
    setAdminResponse(complaint.adminResponse || "")
  }

  const closeModal = () => {
    setSelectedComplaint(null)
    setNewStatus("")
    setAdminResponse("")
  }

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return
    
    setUpdating(true)
    try {
      const response = await axios.patch(
        `${API_BASE}/complaints/${selectedComplaint._id}`,
        { status: newStatus, adminResponse },
        { withCredentials: true }
      )
      
      if (response.data.success) {
        // Update local state
        setComplaints(prev => prev.map(c => 
          c._id === selectedComplaint._id 
            ? { ...c, status: newStatus as Complaint["status"], adminResponse, resolvedAt: newStatus === "resolved" ? new Date().toISOString() : null }
            : c
        ))
        
        // Update stats
        fetchComplaints()
        closeModal()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update complaint")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminNavbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Election monitoring and complaint management</p>
            </div>
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors border border-border"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

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

            {loading ? (
              <CardContainer className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading complaints...</p>
              </CardContainer>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <CardContainer key={complaint._id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}
                          >
                            {getStatusIcon(complaint.status)} {complaint.status.replace("-", " ")}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1 capitalize">
                          {complaint.category.replace("-", " ")}
                        </h3>
                        <p className="text-sm text-foreground mb-2">{complaint.description}</p>
                        <p className="text-xs text-muted-foreground">Voter ID: {complaint.voterId}</p>
                        
                        {complaint.adminResponse && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Admin Response:</p>
                            <p className="text-sm text-foreground bg-muted/30 p-2 rounded">{complaint.adminResponse}</p>
                          </div>
                        )}
                        
                        {complaint.resolvedAt && (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => openUpdateModal(complaint)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Update
                      </button>
                    </div>
                  </CardContainer>
                ))}

                {filteredComplaints.length === 0 && !loading && (
                  <CardContainer className="text-center py-8">
                    <p className="text-muted-foreground">No complaints with this status</p>
                  </CardContainer>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Update Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Update Complaint</h2>
                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Voter ID</p>
                  <p className="text-foreground">{selectedComplaint.voterId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                  <p className="text-foreground capitalize">{selectedComplaint.category.replace("-", " ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selectedComplaint.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Admin Response</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter response to the user (visible to them when they track their complaint)..."
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-medium border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComplaint}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

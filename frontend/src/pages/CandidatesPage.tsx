"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import axios from "axios"
import { X, Scale, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

interface Candidate {
  _id: string
  srNo: string
  name: string
  party: string
  icon: string
  profilePhoto: string
  state: string
  district: string
  ward: string
  education: string
  legalHistory: {
    pendingCases: number
    convictions: number
  }
  manifesto: {
    summary: string
    promises: string[]
    pdfUrl: string
  }
  isReservedSeat: boolean
  reservedCategory: string
  affidavitUrl: string
}

interface FilterOptions {
  states: string[]
  districts: string[]
  wards: string[]
}

const API_BASE = "gdg-backend-hfnlry93o-tanishks-projects-9d31ddd5.vercel.app/api/v1"

export default function CandidatesPage() {
  // Filter states
  const [selectedState, setSelectedState] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedWard, setSelectedWard] = useState("")
  
  // Data states
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ states: [], districts: [], wards: [] })
  const [loading, setLoading] = useState(false)
  
  // UI states
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showAllPromises, setShowAllPromises] = useState<{[key: string]: boolean}>({})

  // Fetch filter options on mount and when filters change
  useEffect(() => {
    fetchFilterOptions()
  }, [selectedState, selectedDistrict])

  // Fetch candidates when ward is selected
  useEffect(() => {
    if (selectedState && selectedDistrict && selectedWard) {
      fetchCandidates()
    }
  }, [selectedState, selectedDistrict, selectedWard])

  const fetchFilterOptions = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedState) params.append("state", selectedState)
      if (selectedDistrict) params.append("district", selectedDistrict)
      
      const res = await axios.get(`${API_BASE}/candidates/filters?${params}`)
      if (res.data.success) {
        setFilterOptions(res.data.data)
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("state", selectedState)
      params.append("district", selectedDistrict)
      params.append("ward", selectedWard)
      
      const res = await axios.get(`${API_BASE}/candidates?${params}`)
      if (res.data.success) {
        setCandidates(res.data.data)
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStateChange = (state: string) => {
    setSelectedState(state)
    setSelectedDistrict("")
    setSelectedWard("")
    setCandidates([])
  }

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    setSelectedWard("")
    setCandidates([])
  }

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 candidates")
        return prev
      }
      return [...prev, id]
    })
  }

  const getComparedCandidates = () => {
    return candidates.filter(c => selectedForCompare.includes(c._id))
  }

  const toggleShowAllPromises = (id: string) => {
    setShowAllPromises(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
            <p className="text-gray-600">Learn about all candidates standing for election in your area</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {filterOptions.states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select District</option>
                  {filterOptions.districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ward</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Ward</option>
                  {filterOptions.wards.map((ward) => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Compare Mode Toggle */}
          {candidates.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{candidates.length} candidate(s) found</p>
              <div className="flex items-center gap-4">
                {selectedForCompare.length > 1 && (
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Scale className="w-4 h-4" />
                    Compare ({selectedForCompare.length})
                  </button>
                )}
                <button
                  onClick={() => {
                    setCompareMode(!compareMode)
                    if (compareMode) setSelectedForCompare([])
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    compareMode 
                      ? "bg-indigo-100 border-indigo-300 text-indigo-700" 
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {compareMode ? "Cancel Compare" : "Select to Compare"}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading candidates...</p>
            </div>
          )}

          {/* No Selection State */}
          {!selectedWard && !loading && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select your location</h3>
              <p className="text-gray-600">Please select state, district, and ward to view candidates</p>
            </div>
          )}

          {/* Candidates Grid */}
          {!loading && candidates.length > 0 && (
            <div className="space-y-6">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  isExpanded={expandedId === candidate._id}
                  onToggleExpand={() => setExpandedId(expandedId === candidate._id ? null : candidate._id)}
                  compareMode={compareMode}
                  isSelectedForCompare={selectedForCompare.includes(candidate._id)}
                  onToggleCompare={() => toggleCompareSelection(candidate._id)}
                  showAllPromises={showAllPromises[candidate._id] || false}
                  onTogglePromises={() => toggleShowAllPromises(candidate._id)}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && selectedWard && candidates.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600">There are no registered candidates for this ward yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          candidates={getComparedCandidates()}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      <Footer />
    </div>
  )
}

// Candidate Card Component
interface CandidateCardProps {
  candidate: Candidate
  isExpanded: boolean
  onToggleExpand: () => void
  compareMode: boolean
  isSelectedForCompare: boolean
  onToggleCompare: () => void
  showAllPromises: boolean
  onTogglePromises: () => void
}

function CandidateCard({
  candidate,
  isExpanded,
  onToggleExpand,
  compareMode,
  isSelectedForCompare,
  onToggleCompare,
  showAllPromises,
  onTogglePromises
}: CandidateCardProps) {
  const visiblePromises = showAllPromises 
    ? candidate.manifesto?.promises || []
    : (candidate.manifesto?.promises || []).slice(0, 5)

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden ${
        isSelectedForCompare ? "border-indigo-500" : "border-gray-200"
      }`}
    >
      {/* Collapsed View - Always Visible */}
      <div 
        className="flex flex-col lg:flex-row cursor-pointer"
        onClick={compareMode ? onToggleCompare : onToggleExpand}
      >
        {/* Left Section - Dark Background */}
        <div className="bg-gray-900 text-white p-6 lg:w-80 flex-shrink-0">
          <div className="flex flex-col items-center text-center">
            {/* Party Icon */}
            <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center text-4xl mb-4">
              {candidate.icon || "👤"}
            </div>
            
            {/* Name */}
            <h3 className="text-xl font-bold mb-1">{candidate.name}</h3>
            
            {/* Party */}
            <p className="text-gray-300 text-sm mb-2">{candidate.party}</p>
            
            {/* Ward */}
            <p className="text-amber-400 font-medium text-sm mb-3">
              {candidate.ward} • {candidate.district}
            </p>
            
            {/* Reserved Seat Badge */}
            {candidate.isReservedSeat && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                {candidate.reservedCategory}
              </span>
            )}

            {/* Compare Checkbox */}
            {compareMode && (
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelectedForCompare}
                    onChange={onToggleCompare}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">Select to compare</span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 justify-center">
            {candidate.affidavitUrl && (
              <a
                href={candidate.affidavitUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-transparent border border-white text-white text-sm rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
              >
                View Affidavit
              </a>
            )}
          </div>
        </div>

        {/* Right Section - Light Background */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div>
              <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Education</h4>
              <p className="text-gray-900 font-medium">{candidate.education || "Not specified"}</p>
            </div>

            {/* Legal History */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Legal History</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{candidate.legalHistory?.pendingCases || 0}</span>
                  <span className="text-sm text-gray-600">
                    Pending cases that could result <span className="text-red-500">in 2+ year sentence</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{candidate.legalHistory?.convictions || 0}</span>
                  <span className="text-sm text-gray-600">
                    Convicted with <span className="text-red-500">1+ year imprisonment</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expand Indicator */}
          <div className="mt-4 flex items-center justify-center text-gray-500">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
            <span className="text-sm ml-1">{isExpanded ? "Click to collapse" : "Click to expand"}</span>
          </div>
        </div>
      </div>

      {/* Expanded View - Manifesto Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4">Party Manifesto</h4>
          
          {/* Summary */}
          {candidate.manifesto?.summary && (
            <p className="text-gray-700 leading-relaxed mb-6">{candidate.manifesto.summary}</p>
          )}

          {/* Promises */}
          {visiblePromises.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {visiblePromises.map((promise, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg uppercase font-medium"
                >
                  {promise}
                </span>
              ))}
              {(candidate.manifesto?.promises?.length || 0) > 5 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePromises()
                  }}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  {showAllPromises ? "Show Less" : `+${(candidate.manifesto?.promises?.length || 0) - 5} MORE • VIEW ALL`}
                </button>
              )}
            </div>
          )}

          {/* Manifesto PDF Link */}
          {candidate.manifesto?.pdfUrl && (
            <a
              href={candidate.manifesto.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Download Full Manifesto PDF
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// Compare Modal Component
interface CompareModalProps {
  candidates: Candidate[]
  onClose: () => void
}

function CompareModal({ candidates, onClose }: CompareModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h2 className="text-2xl font-bold">Compare Candidates</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left font-semibold text-gray-700 w-40">Attribute</th>
                {candidates.map(c => (
                  <th key={c._id} className="p-4 text-center font-semibold text-gray-900">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-2xl mb-2">
                        {c.icon || "👤"}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Party */}
              <tr>
                <td className="p-4 font-medium text-gray-700">Party</td>
                {candidates.map(c => (
                  <td key={c._id} className="p-4 text-center text-gray-900">{c.party}</td>
                ))}
              </tr>
              
              {/* Education */}
              <tr className="bg-gray-50">
                <td className="p-4 font-medium text-gray-700">Education</td>
                {candidates.map(c => (
                  <td key={c._id} className="p-4 text-center text-gray-900">{c.education || "Not specified"}</td>
                ))}
              </tr>
              
              {/* Pending Cases */}
              <tr>
                <td className="p-4 font-medium text-gray-700">Pending Cases</td>
                {candidates.map(c => (
                  <td key={c._id} className="p-4 text-center">
                    <span className={`text-2xl font-bold ${(c.legalHistory?.pendingCases || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                      {c.legalHistory?.pendingCases || 0}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Convictions */}
              <tr className="bg-gray-50">
                <td className="p-4 font-medium text-gray-700">Convictions</td>
                {candidates.map(c => (
                  <td key={c._id} className="p-4 text-center">
                    <span className={`text-2xl font-bold ${(c.legalHistory?.convictions || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                      {c.legalHistory?.convictions || 0}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Reserved Category */}
              <tr>
                <td className="p-4 font-medium text-gray-700">Category</td>
                {candidates.map(c => (
                  <td key={c._id} className="p-4 text-center">
                    {c.isReservedSeat ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">{c.reservedCategory}</span>
                    ) : (
                      <span className="text-gray-500">General</span>
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Key Promises */}
              <tr className="bg-gray-50">
                <td className="p-4 font-medium text-gray-700">Key Promises</td>
                {candidates.map(c => (
                  <td key={c._id} className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {c.manifesto?.promises?.slice(0, 3).map((promise, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {promise}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  )
}
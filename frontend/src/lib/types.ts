export interface Candidate {
  id: string
  name: string
  party: string
  partySymbol: string
  education: string
  workSummary: string
  additionalInfo: string
}

export interface VotingState {
  voterId?: string
  faceVerified: boolean
  otpVerified: boolean
  currentStep: "voter-id" | "face" | "otp" | "voting" | "success"
  selectedCandidateId?: string
  voteLocked: boolean
}

export interface ComplaintType {
  id: string
  voterId: string
  category: string
  description: string
  status: "submitted" | "under-review" | "resolved"
  submittedAt: Date
}

export interface ResultsData {
  state: string
  district: string
  ward: string
  totalVotes: number
  candidates: Array<{
    id: string
    name: string
    party: string
    votes: number
    percentage: number
  }>
}

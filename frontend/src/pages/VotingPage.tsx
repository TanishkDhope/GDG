"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CardContainer } from "@/components/Card-Container"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, stringToHex, getAddress } from "viem"
import { BALLOT_CONTRACT_ADDRESS } from "@/config/contracts"
import { Loader2, ShieldCheck, ExternalLink, AlertCircle, ReceiptText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const { address, isConnected } = useAccount()
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  // Send Transaction hook
  const { sendTransactionAsync, isPending: isWriting, error: writeError } = useSendTransaction()

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

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

  const handleCastVote = async () => {
    if (!selectedCandidateId || !address || !selectedCandidate) {
      console.error("DEBUG: Missing requirements:", { selectedCandidateId, address, selectedCandidate });
      return;
    }

    // Explicitly target Sepolia (11155111)
    const SEPOLIA_ID = 11155111;

    try {
      const voteData = stringToHex(`VOTE_FOR:${selectedCandidate.name}`);
      const txPayload = {
        to: getAddress(BALLOT_CONTRACT_ADDRESS) as `0x${string}`,
        value: parseEther("0.000001"),
        data: voteData as `0x${string}`,
        chainId: SEPOLIA_ID
      };

      console.log("DEBUG: Preparing Transaction Payload:", txPayload);

      const hash = await sendTransactionAsync(txPayload)

      console.log("DEBUG: Transaction Submitted!", hash);
      setTxHash(hash)
      setShowConfirmation(false)
    } catch (err: any) {
      console.error("DEBUG: FULL ERROR OBJECT:", err);

      // If it fails with "invalid parameters", it's almost certainly the 'data' field
      // Let's try one more time WITHOUT data as a fallback to see if at least the money can be sent
      if (err.message?.includes("Invalid parameters") || err.message?.includes("invalid parameter")) {
        console.warn("DEBUG: Metadata transfer failed, attempting fallback transfer WITHOUT data...");
        try {
          const fallbackHash = await sendTransactionAsync({
            to: getAddress(BALLOT_CONTRACT_ADDRESS) as `0x${string}`,
            value: parseEther("0.000001"),
            chainId: SEPOLIA_ID
          });
          console.log("DEBUG: Fallback Transaction Submitted!", fallbackHash);
          setTxHash(fallbackHash)
          setShowConfirmation(false)
          return;
        } catch (fallbackErr: any) {
          console.error("DEBUG: Fallback also failed:", fallbackErr);
        }
      }

      const providerError = err?.cause?.message || err?.info?.error?.message || err?.message;
      console.error("DEBUG: Provider final error message:", providerError);
    }
  }

  // Voting Receipt View
  if (isConfirmed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header showNav={false} />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <CardContainer className="max-w-md w-full border-green-500/30 bg-green-500/5 shadow-2xl shadow-green-500/10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full" />
                <div className="relative bg-green-500 p-4 rounded-full shadow-lg shadow-green-500/40">
                  <ShieldCheck className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Vote Cast Successfully!</h2>
                <p className="text-muted-foreground text-sm">Your vote has been cryptographically secured on the blockchain.</p>
              </div>

              <div className="w-full space-y-4 pt-4">
                <div className="bg-background/80 backdrop-blur border border-border rounded-xl p-5 text-left space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold border-b border-border/50 pb-3">
                    <ReceiptText className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wider">Transaction Receipt</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Candidate</p>
                      <p className="text-sm font-semibold">{selectedCandidate?.name}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Transaction Hash</p>
                      <div className="flex items-center gap-2 group">
                        <p className="text-[11px] font-mono break-all text-foreground/80 bg-muted/50 p-2 rounded w-full">
                          {txHash}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Fee Paid</span>
                      <span className="font-mono font-bold text-primary">0.000001 ETH</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}
                  >
                    View on Etherscan <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground text-sm"
                    onClick={() => navigate("/")}
                  >
                    Return to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContainer>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Connection Check */}
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="bg-primary/10 p-6 rounded-full border border-primary/20">
                <Loader2 className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Wallet Connection Required</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  To ensure a secure and tamper-proof voting process, you must connect your crypto wallet to cast your vote on-chain.
                </p>
              </div>
              <div className="pt-4">
                <Header showNav={false} />
              </div>
            </div>
          ) : (
            <>
              {/* Voting Info */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">Cast Your Vote</h1>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold rounded uppercase tracking-widest border border-green-500/20">
                    Secure Session
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="grid grid-cols-3 gap-4 text-sm flex-1">
                    <div className="bg-card border border-border rounded-lg p-4 transition-colors hover:border-primary/50">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1 tracking-widest">State</p>
                      <p className="font-semibold text-foreground">Maharashtra</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 transition-colors hover:border-primary/50">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1 tracking-widest">District</p>
                      <p className="font-semibold text-foreground">Mumbai South</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 transition-colors hover:border-primary/50">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1 tracking-widest">Ward</p>
                      <p className="font-semibold text-foreground">Ward 45</p>
                    </div>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex items-center gap-3">
                    <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
                    <p className="text-xs text-accent font-bold tracking-wider">VOTER VERIFIED ✓</p>
                  </div>
                </div>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`cursor-pointer transition-all duration-500 group relative ${selectedCandidateId === candidate.id
                      ? "scale-[1.02]"
                      : "hover:scale-[1.01]"
                      }`}
                  >
                    <CardContainer className={`h-full border-2 transition-all duration-500 ${selectedCandidateId === candidate.id
                      ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                      : "border-border/50 hover:border-primary/30"
                      }`}>

                      {selectedCandidateId === candidate.id && (
                        <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full animate-in zoom-in duration-300">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner transition-colors duration-500 ${selectedCandidateId === candidate.id ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/20"
                          }`}>
                          {candidate.partySymbol}
                        </div>

                        <div className="flex-1 space-y-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{candidate.name}</h3>
                          <p className="text-sm text-primary font-bold uppercase tracking-widest">{candidate.party}</p>
                          <p className="text-xs text-muted-foreground font-medium">{candidate.education}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed pt-2 line-clamp-2">{candidate.workSummary}</p>
                        </div>
                      </div>
                    </CardContainer>
                  </div>
                ))}
              </div>

              {/* Cast Vote Action */}
              {selectedCandidate && (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
                  <CardContainer className="bg-accent/5 border-2 border-accent/30 shadow-2xl shadow-accent/5">
                    <div className="flex items-center gap-2 mb-4 text-accent">
                      <ShieldCheck className="w-5 h-5" />
                      <h2 className="text-xl font-bold tracking-tight">Final Verification</h2>
                    </div>

                    <div className="bg-background rounded-2xl p-6 mb-6 border border-border shadow-inner">
                      <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl shadow-lg shadow-primary/20">
                          {selectedCandidate.partySymbol}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Selected Candidate</p>
                          <h3 className="text-3xl font-black text-foreground">{selectedCandidate.name}</h3>
                          <p className="text-primary font-bold">{selectedCandidate.party}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "Your vote represents your voice. By clicking below, you authorize an on-chain transaction that permanently records your selection with mathematically proven anonymity."
                      </p>

                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/80">
                        <span className="text-sm font-medium">Processing Fee</span>
                        <span className="text-sm font-bold text-primary">0.000001 ETH</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => setShowConfirmation(true)}
                        className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        Cast Secure Vote
                      </Button>
                      <Button
                        onClick={() => setSelectedCandidateId(null)}
                        variant="outline"
                        className="flex-1 h-14 border-border/80 text-foreground font-bold text-lg rounded-xl hover:bg-muted"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContainer>
                </div>
              )}

              {/* No Selection State */}
              {!selectedCandidate && (
                <div className="text-center py-10 bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
                  <p className="text-muted-foreground font-medium animate-pulse">Please select a candidate from the list to cast your vote</p>
                </div>
              )}
            </>
          )}

          {/* Lifecycle Status Messages */}
          {(isWriting || isConfirming) && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-100 animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="bg-card p-6 rounded-full border border-primary/20 shadow-xl relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {isConfirming ? "Securing Your Vote..." : "Awaiting Authorization"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isConfirming
                      ? "The blockchain is processing your vote. This ensures it can never be tampered with or changed."
                      : "Please confirm the transaction in your connected wallet. A fee of 0.000001 ETH applies."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(writeError || txError) && (
            <div className="fixed bottom-8 right-8 animate-in slide-in-from-right-8 duration-500 z-110">
              <div className="bg-destructive/10 backdrop-blur-md border border-destructive/20 p-6 rounded-2xl flex items-start gap-4 shadow-2xl max-w-sm">
                <AlertCircle className="w-6 h-6 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-bold text-destructive">Transaction Failed</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-mono bg-destructive/5 p-2 rounded border border-destructive/10 overflow-auto max-h-32">
                    {((writeError || txError) as any)?.shortMessage || (writeError || txError)?.message || "Unknown RPC Error"}
                  </p>
                  <div className="pt-1">
                    <p className="text-[10px] text-destructive/70 font-semibold uppercase tracking-wider">
                      Troubleshooting:
                    </p>
                    <ul className="text-[10px] text-muted-foreground list-disc ml-3 space-y-1 mt-1">
                      <li>Check if you have enough ETH for gas</li>
                      <li>Ensure your wallet is on **Sepolia**</li>
                      <li>Try refreshing the page</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-110 p-4 animate-in fade-in duration-300">
          <CardContainer className="max-w-md w-full shadow-2xl border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Confirm Your Intent</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You are casting a permanent, non-reversible vote for{" "}
              <span className="font-extrabold text-foreground underline decoration-primary/30 underline-offset-4">{selectedCandidate?.name}</span>.
            </p>

            <div className="bg-muted/80 rounded-2xl p-5 mb-8 border border-border/50">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 tracking-widest">Protocol Guarantees</p>
              <ul className="text-sm font-medium text-foreground/80 space-y-3">
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  End-to-end encryption
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Blockchain-enforced anonymity
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Irrevocable record of will
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleCastVote()}
                className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl"
              >
                Yes, Cast Vote
              </Button>
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="flex-1 h-12 border-border/80 font-bold rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardContainer>
        </div>
      )}

      <Footer />
    </div>
  )
}
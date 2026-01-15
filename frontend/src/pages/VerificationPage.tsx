import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Footer } from "@/components/Footer"
import { StepIndicator } from "@/components/Step-Indicator"
import { CardContainer } from "@/components/Card-Container"
import { Header } from "@/components/Header"
import axios from "axios"

type VerificationStep = "voter-id" | "face" | "otp"

export default function VerificationPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<VerificationStep>("voter-id")
  const [voterId, setVoterId] = useState("")
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = ["Voter ID", "Face Verification", "OTP Verification"]

  const stepIndex = steps.findIndex((step) => {
    if (step === "Voter ID") return currentStep === "voter-id"
    if (step === "Face Verification") return currentStep === "face"
    if (step === "OTP Verification") return currentStep === "otp"
    return false
  })

  const handleVoterIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!voterId.trim()) {
      setError("Please enter your Voter ID")
      return
    }
    if (!fullName.trim()) {
      setError("Please enter your full name")
      return
    }
    if (!dateOfBirth) {
      setError("Please enter your date of birth")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`http://localhost:8000/api/v1/voters/verify`, {
        voterID: voterId,
        fullName,
        dateOfBirth,
      })

      if (response.data.success) {
        alert("Voter ID verified successfully!")
        setCurrentStep("face")
      }
    } catch (err: any) {
      alert("Voter ID verification failed.")
      setError(err.response?.data?.message || "Verification failed. Please check your details and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFaceVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!faceImage) {
      setError("Please upload a face image")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`http://localhost:8000/api/v1/voters/send-otp`, {
        voterID: voterId,
      })

      if (response.data.success) {
        alert("OTP sent to your registered mobile number!")
        setCurrentStep("otp")
      }
    } catch (err: any) {
      alert("Failed to send OTP.")
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otp.trim() || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`http://localhost:8000/api/v1/voters/verify-otp`, {
        voterID: voterId,
        otp,
      })

      if (response.data.success) {
        alert("OTP verified successfully!")
        navigate("/voting")
      }
    } catch (err: any) {
      alert("OTP verification failed.")
      setError(err.response?.data?.message || "Verification failed. Please check your OTP and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={false} />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <StepIndicator steps={steps} currentStep={stepIndex} />

          {currentStep === "voter-id" && (
            <CardContainer className="mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Verify Your Identity</h2>
              <form onSubmit={handleVoterIdSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Voter ID Number</label>
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC1234567"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Verifying..." : "Continue to Face Verification"}
                </button>
              </form>
            </CardContainer>
          )}

          {currentStep === "face" && (
            <CardContainer className="mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Face Verification</h2>
              <form onSubmit={handleFaceVerification} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            setFaceImage(event.target?.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    {faceImage ? (
                      <img src={faceImage} alt="Face verification" className="max-h-40 mx-auto rounded" />
                    ) : (
                      <p>Click to upload face image</p>
                    )}
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Verifying Face..." : "Continue to OTP Verification"}
                </button>
              </form>
            </CardContainer>
          )}

          {currentStep === "otp" && (
            <CardContainer className="mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Mobile OTP Verification</h2>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl border border-border rounded-lg"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Verifying OTP..." : "Proceed to Voting"}
                </button>
              </form>
            </CardContainer>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

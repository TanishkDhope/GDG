"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Footer } from "@/components/Footer"
import { StepIndicator } from "@/components/Step-Indicator"
import { CardContainer } from "@/components/Card-Container"
import { Header } from "@/components/Header"
type VerificationStep = "voter-id" | "face" | "otp"

export default function VerificationPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<VerificationStep>("voter-id")
  const [voterId, setVoterId] = useState("")
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<number | null>(null)

  const steps = ["Voter ID", "Face Verification", "OTP Verification"]
  const stepIndex = steps.findIndex((step) => {
    if (step === "Voter ID") return currentStep === "voter-id"
    if (step === "Face Verification") return currentStep === "face"
    if (step === "OTP Verification") return currentStep === "otp"
    return false
  })

  const handleVoterIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!voterId.trim()) {
      alert("Please enter your Voter ID")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentStep("face")
    }, 800)
  }

  // Keep the same check (only require faceImage to be set)
  const handleFaceVerification =async (e: React.FormEvent) => {
    e.preventDefault()
    if (!faceImage) {
      alert("Please allow camera access so we can capture your face")
      return
    }
    // stop camera when proceeding
    stopCamera()
    setLoading(true)
    console.log("Sending face image for verification:", { voter_id: voterId, image: faceImage })
    const response= await fetch("http://localhost:5000/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voter_id: voterId,
        image: faceImage,
      }),
    })
    console.log(response)
    setTimeout(() => {
      setLoading(false)
      setCurrentStep("otp")
    }, 800)
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate("/voting")
    }, 800)
  }

  // --- Camera start/stop & capture logic ---
  async function startCameraAndCaptureContinuously() {
    if (!videoRef.current) return
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      })
      videoRef.current.srcObject = streamRef.current
      await videoRef.current.play()

      // capture once immediately and then every 1s
      captureFrameToState()
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current)
      }
      detectionIntervalRef.current = window.setInterval(captureFrameToState, 1000)
    } catch (err) {
      console.error("Camera start error:", err)
      alert("Camera access denied or not available.")
    }
  }

  function stopCamera() {
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
  }

  function captureFrameToState() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    try {
      const dataUrl = canvas.toDataURL("image/jpeg")
      setFaceImage(dataUrl)
    } catch (err) {
      console.error("capture to dataURL failed:", err)
    }
  }

  // start camera automatically when user navigates to face step
  useEffect(() => {
    if (currentStep === "face") {
      // start camera right away
      startCameraAndCaptureContinuously()
    } else {
      stopCamera()
    }

    // cleanup on unmount
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={false} />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <StepIndicator steps={steps} currentStep={stepIndex} />

          {currentStep === "voter-id" && (
            <CardContainer className="mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Enter Your Voter ID</h2>
              <form onSubmit={handleVoterIdSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Voter ID Number</label>
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC1234567"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your Voter ID can be found on your voting registration document or online at the Election Commission
                    website.
                  </p>
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
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    We will start your camera automatically — allow camera access when prompted. A clear photo of your face will
                    be captured for verification. Your image is used only for this verification and is not stored long-term.
                  </p>

                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <div className="camera-container">
                      <video ref={videoRef} id="videoFeed" autoPlay playsInline className="mx-auto max-h-40 rounded" />
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>

                    {faceImage ? (
                      <div>
                        <img src={faceImage} alt="Captured face" className="max-h-40 mx-auto mb-2 rounded" />
                        <p className="text-sm font-medium text-primary">Camera captured image ✓</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground mt-2">Waiting for camera capture...</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Processing..." : "Continue to OTP Verification"}
                </button>
              </form>
            </CardContainer>
          )}

          {currentStep === "otp" && (
            <CardContainer className="mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Mobile OTP Verification</h2>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    A 6-digit OTP has been sent to your registered mobile number. Please enter it below.
                  </p>
                  <label className="block text-sm font-medium text-foreground mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={6}
                  />
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    ⏱️ Resend OTP in <span className="font-semibold text-foreground">2:45</span>
                  </p>
                </div>

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

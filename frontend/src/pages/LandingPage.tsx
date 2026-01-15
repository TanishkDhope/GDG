"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function Home() {
  const navigate = useNavigate()
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const checkRegistrationStatus = () => {
      const registered = localStorage.getItem('voterRegistered') === 'true'
      setIsRegistered(registered)
    }
    checkRegistrationStatus()
    window.addEventListener('storage', checkRegistrationStatus)
    return () => window.removeEventListener('storage', checkRegistrationStatus)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />

      {/* Tricolor Banner */}
      <div className="flex h-2">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b-4 border-[#1a237e] py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Official Emblem */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                    alt="National Emblem of India" 
                    className="h-20 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
              
              <p className="text-sm text-[#1a237e] font-medium tracking-wide mb-1">
                ELECTION COMMISSION OF INDIA
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1a237e] mb-2">
                National Voters' Service Portal
              </h1>
              <p className="text-lg text-gray-600 mb-1">
                राष्ट्रीय मतदाता सेवा पोर्टल
              </p>
              <p className="text-base text-gray-500 mb-8">
                Secure • Transparent • Blockchain-Verified
              </p>

              {/* Status Badge */}
              <div className="mb-8">
                {isRegistered ? (
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-green-50 border border-green-300 text-green-800 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Verified Voter - Ready to Cast Vote
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-amber-50 border border-amber-300 text-amber-800 text-sm font-medium">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Please complete voter verification to proceed
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <button
                  onClick={() => navigate("/verify")}
                  disabled={isRegistered}
                  className={`px-8 py-3 font-semibold rounded-md transition-all shadow-sm ${
                    isRegistered
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF9933] text-white hover:bg-[#e8890f] hover:shadow-md'
                  }`}
                >
                  Voter Verification
                </button>
                <button
                  onClick={() => navigate("/voting")}
                  disabled={!isRegistered}
                  className={`px-8 py-3 font-semibold rounded-md transition-all shadow-sm ${
                    !isRegistered
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#138808] text-white hover:bg-[#0f6b06] hover:shadow-md'
                  }`}
                >
                  Cast Your Vote
                </button>
                <button
                  onClick={() => navigate("/results")}
                  className="px-8 py-3 bg-[#1a237e] text-white font-semibold rounded-md hover:bg-[#151c64] transition-all shadow-sm hover:shadow-md"
                >
                  View Results
                </button>
              </div>

              <button
                onClick={() => navigate("/candidates")}
                className="text-[#1a237e] font-medium hover:underline text-sm"
              >
                View All Candidates →
              </button>
            </div>
          </div>
        </section>

        {/* Quick Services */}
        <section className="py-10 bg-[#f5f5f5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#1a237e] text-center mb-8">Voter Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: "🪪", title: "Verify Identity", desc: "Voter ID & Face Verification", action: () => navigate("/verify") },
                { icon: "📊", title: "Live Results", desc: "Real-time Vote Count", action: () => navigate("/results") },
                { icon: "❓", title: "Help & Support", desc: "FAQs & Grievance", action: () => navigate("/help") },
              ].map((service, idx) => (
                <button
                  key={idx}
                  onClick={service.action}
                  className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:shadow-md hover:border-[#1a237e]/30 transition-all group"
                >
                  <div className="text-3xl mb-3">{service.icon}</div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#1a237e] mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-500">{service.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Voting Process */}
        <section className="py-10 bg-white border-y border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#1a237e] text-center mb-2">Voting Process</h2>
            <p className="text-center text-gray-500 text-sm mb-8">मतदान प्रक्रिया</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Enter Voter ID", desc: "Provide your EPIC number for verification" },
                { step: "02", title: "Face Verification", desc: "Complete biometric authentication" },
                { step: "03", title: "OTP Verification", desc: "Verify registered mobile number" },
                { step: "04", title: "Cast Your Vote", desc: "Select candidate and confirm vote" },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a237e] text-white font-bold text-lg mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notice */}
        {/* <section className="py-8 bg-[#fff3cd] border-y border-[#ffc107]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-bold text-[#856404] mb-1">Important Notice / महत्वपूर्ण सूचना</h3>
                <ul className="text-sm text-[#856404] space-y-1">
                  <li>• This is an official digital voting portal. Your vote is secured using blockchain technology.</li>
                  <li>• Ensure your Voter ID (EPIC) and registered mobile number are updated with the Election Commission.</li>
                  <li>• Each voter can cast only ONE vote. Once submitted, votes cannot be changed.</li>
                  <li>• For technical assistance, visit the Help & Support section or contact your local BLO.</li>
                </ul>
              </div>
            </div>
          </div>
        </section> */}

        {/* Security Features */}
        <section className="py-10 bg-[#f5f5f5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#1a237e] text-center mb-8">Security & Transparency</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="font-semibold text-gray-800 mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-gray-500">Your vote is encrypted and cannot be traced back to your identity</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">⛓️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Blockchain Verified</h3>
                <p className="text-sm text-gray-500">All votes are recorded on immutable blockchain ledger</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Tamper-Proof</h3>
                <p className="text-sm text-gray-500">No vote can be modified, deleted, or duplicated</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-8 bg-white border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm font-medium text-gray-800">Toll Free Helpline</p>
                <p className="text-lg font-bold text-[#1a237e]">1950</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Email Support</p>
                <p className="text-[#1a237e]">complaints@eci.gov.in</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Official Website</p>
                <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#1a237e] hover:underline">
                  www.eci.gov.in
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tricolor Banner */}
      <div className="flex h-2">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <Footer />
    </div>
  )
}
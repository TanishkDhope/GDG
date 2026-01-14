import { Link } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CardContainer } from "@/components/Card-Container"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={false} />

      <main className="flex-1 flex items-center justify-center py-12">
        <CardContainer className="text-center max-w-xl">
          <div className="text-7xl mb-6 animate-bounce">✓</div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            Vote Cast Successfully!
          </h1>

          <div className="bg-accent/10 border border-accent rounded-lg p-6 mb-8">
            <p className="text-foreground font-semibold mb-2">
              Your vote has been securely recorded
            </p>
            <p className="text-sm text-muted-foreground">
              Your vote is now locked on the blockchain and completely anonymous.
              You can track the election results in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">🔒</p>
              <p className="text-xs font-medium text-foreground mt-2">
                Encrypted Vote
              </p>
            </div>

            <div className="bg-secondary rounded-lg p-4">
              <p className="text-2xl font-bold text-accent">🕵️</p>
              <p className="text-xs font-medium text-foreground mt-2">
                Anonymous
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mb-8">
            Thank you for participating in this democratic election.
            Your voice matters!
          </p>

          <div className="flex flex-col gap-4">
            <Link
              to="/results"
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
            >
              View Live Results
            </Link>

            <Link
              to="/"
              className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-muted transition-colors border border-border text-center"
            >
              Back to Home
            </Link>
          </div>
        </CardContainer>
      </main>

      <Footer />
    </div>
  )
}
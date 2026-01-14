"use client"

import {Link} from "react-router-dom"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  showNav?: boolean
}

export function Header({ showNav = true }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              🇮🇳
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Project BALLOT</h1>
              <p className="text-xs text-muted-foreground">Secure Voting System</p>
            </div>
          </Link>

          {showNav && (
            <nav className="flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/candidates")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Candidates
              </button>
              <button
                onClick={() => navigate("/results")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Results
              </button>
              <button
                onClick={() => navigate("/help")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Help
              </button>
              <button
                onClick={() => navigate("/admin")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Admin
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

import {Link} from "react-router-dom"

interface AdminNavbarProps {
  showNav?: boolean
}

export function AdminNavbar({ showNav = true }: AdminNavbarProps) {

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              🇮🇳
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Project BALLOT</h1>
              <p className="text-xs text-muted-foreground">Secure Voting System</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}

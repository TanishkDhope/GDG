export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              Project BALLOT is a secure, blockchain-based voting system ensuring transparent and anonymous elections.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Important Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Government Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Election Commission
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  India.gov.in
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Project BALLOT. All votes are secure and anonymous.</p>
          <p className="mt-2 text-xs">This is a secure voting system designed for transparent democratic elections.</p>
        </div>
      </div>
    </footer>
  )
}
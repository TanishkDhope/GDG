import { Link } from "react-router-dom";
import ModeToggle from "@/components/ModeToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";


export default function Navbar() {
     
  return (
    <>
      <nav className="flex items-center justify-between p-7 bg-background/80 backdrop-blur-sm text-foreground border-b border-border font-geist-sans fixed top-0 w-full z-50">
        <Link to="/" className="text-3xl font-bold cursor-pointer transition-transform active:scale-95">
          Trace
        </Link>
        <div className="flex items-center justify-center gap-10 tracking-wider">
          <Link
            to="/market"
            className="font-geist-sans text-xl hover:text-primary hover:scale-95 transition-all duration-300 ease-in cursor-pointer"
          >
            Explore
          </Link>

          <a

            href="/studio"
            className="font-geist-sans text-xl hover:text-primary tracking-[0.07em] hover:scale-95 transition-all duration-300 ease-in cursor-pointer"
          >
            AI Studio
          </a>

          <a href="#" onClick={(e) => e.preventDefault()} className="font-geist-sans text-xl hover:text-primary tracking-[0.07em] hover:scale-95 transition-all duration-300 ease-in opacity-50 cursor-not-allowed">Sell</a>
          <a
            href="/vault"
            className="font-geist-sans text-xl hover:text-primary tracking-[0.07em] hover:scale-95 transition-all duration-300 ease-in cursor-pointer"
          >
            My Vault
          </a>
        </div>
        <div className="flex items-center justify-center gap-5">
          <ConnectButton label="Sign In" />
          <ModeToggle />
        </div>
      </nav>
    </>
  );
}

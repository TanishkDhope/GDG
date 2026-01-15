import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SignatureCard from "@/components/SignatureCard";
// import { SIGNATURES } from "@/constants/signatures";
// import PaginationComponent from "@/components/PaginationComponent";
import Providers from "@/components/Providers";
import LandingPage from "@/pages/LandingPage";
import CandidatesPage from "./pages/CandidatesPage";
import ResultsPage from "./pages/ResultsPage";
import HelpPage from "./pages/HelpPage";
import AdminPage from "./pages/AdminPage";
import VerificationPage from "./pages/VerificationPage";
import VotingPage from "./pages/VotingPage";
import SuccessPage from "./pages/SuccessPage";
import Test from "./components/Test";
import BallotScanner from "./components/BallotScanner";
import TestVoting from "./pages/TestVoting";
import AdminLogin from "./pages/AdminLogin.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Providers>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ballot" 
              element={
                <ProtectedRoute>
                  <BallotScanner />
                </ProtectedRoute>
              } 
            />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/voting" element={<VotingPage />} />
            <Route path="/success" element={<SuccessPage />} />
            {/* <Route path="/test" element={<Test />} /> */}
            <Route path="/testVoting" element={<TestVoting/>}/>
            <Route path="/adminLogin" element={<AdminLogin />} />
          </Routes>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SignatureCard from "@/components/SignatureCard";
// import { SIGNATURES } from "@/constants/signatures";
// import PaginationComponent from "@/components/PaginationComponent";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider"
import Market from "./components/Market";
import Vault from "./components/Vault";
import AIGenerator from "./components/AIGenerator";
import Test from "./components/Test";
import BallotScanner from "./components/BallotScanner";


function App() {
  return (
    <BrowserRouter>
      <Providers>
          <Routes>
            <Route path="/test" element={<Test/>}/>
            <Route path="/" element={<ProductLandingPage />} />
            <Route path="/market" element={<Market />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/studio" element={<AIGenerator />} />
            <Route path="/scanner" element={<BallotScanner/>}/>
          </Routes>
      </Providers>
    </BrowserRouter>
  );
}

export default App;


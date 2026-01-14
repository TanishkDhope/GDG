
import  { useState } from "react";

import SignatureCard from "@/components/SignatureCard";
import { SIGNATURES } from "@/constants/signatures";
import PaginationComponent from "@/components/PaginationComponent";
import Navbar from "@/components/Navbar";

export default function Market() {
    const [currentPage, setCurrentPage] = useState(1);
      const ITEMS_PER_PAGE = 8;
    
      const totalPages = Math.ceil(SIGNATURES.length / ITEMS_PER_PAGE);
    
 
      const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
      const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
      const currentItems = SIGNATURES.slice(indexOfFirstItem, indexOfLastItem);
    
      const handlePageChange = (page: number) => {
        setCurrentPage(page);
 
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    return(
        <div>
            <div className="w-full min-h-screen relative ">
              <Navbar />
                        <div className="max-w-8xl mx-auto px-6 mt-32">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
                            <div>
                              <header>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                                  Marketplace
                                </h1>
                                <p className="text-muted-foreground text-lg max-w-2xl">
                                  Discover, collect, and sell extraordinary NFT signatures from the world's most talented digital artists.
                                </p>
                              </header>
                            </div>
                            <div className="mt-8 md:mt-0">
                              <PaginationComponent
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                            {currentItems.map((sig) => (
                              <div key={sig.id}>
                                <SignatureCard {...sig} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-center mt-12">
                          <PaginationComponent
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      </div>
        </div>
    )
}
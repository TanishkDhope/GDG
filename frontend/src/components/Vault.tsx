import { useState, useEffect } from "react";
import { Wallet, PackageOpen, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useReadContracts } from "wagmi";
import SignatureCard from "@/components/SignatureCard";
import { SIGNATURES } from "@/constants/signatures";
import { SIGNATURE_NFT_ABI } from "@/abi/nft";

import { NFT_CONTRACT_ADDRESS } from "@/config/contracts";


export default function Vault() {
    const { address, isConnected } = useAccount();
    const [localOwnedIds, setLocalOwnedIds] = useState<string[]>([]);

    // 1. Load from localStorage for immediate persistence
    useEffect(() => {
        const purchased = JSON.parse(localStorage.getItem('purchased_nfts') || '[]');
        setLocalOwnedIds(purchased);
    }, []);

    // 2. Read ownership from the blockchain
    const { data: owners, isFetching } = useReadContracts({
        contracts: SIGNATURES.map((sig) => ({
            address: NFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: SIGNATURE_NFT_ABI,
            functionName: "ownerOf",
            args: [BigInt(sig.id)],
        })),
    });

    // 3. Combine both sources: locally saved or on-chain verified
    const ownedSignatures = SIGNATURES.filter((sig, index) => {
        const onChainOwner = owners?.[index]?.result;
        const isOwnerOnChain = onChainOwner && address &&
            String(onChainOwner).toLowerCase() === String(address).toLowerCase();

        const isOwnerLocally = localOwnedIds.includes(sig.id);

        return isOwnerOnChain || isOwnerLocally;
    });

    if (!isConnected) {
        return (
            <div className="max-w-8xl mx-auto px-6 mt-32 flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-accent/5 p-6 rounded-full mb-6">
                    <Wallet className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Wallet Disconnected</h3>
                <p className="text-muted-foreground mb-8 max-w-md"> Please connect your wallet to view your collection. </p>
                <Button  variant="outline" className="rounded-xl">Back to Market</Button>
            </div>
        );
    }

    return (
        <div className="max-w-8xl mx-auto px-6 mt-32 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                       
                        className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-0 hover:bg-transparent"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Marketplace
                    </Button>
                    <div className="flex items-center gap-4">
                        <header>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight flex items-center gap-3">
                                <Wallet className="w-10 h-10 text-primary" />
                                My Vault
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Your personal collection, partially stored locally and verified by the blockchain.
                            </p>
                        </header>
                    </div>
                </div>

                {isFetching && (
                    <div className="mt-4 md:mt-0 flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium uppercase tracking-wider">Syncing Blockchain</span>
                    </div>
                )}
            </div>

            {ownedSignatures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                    {ownedSignatures.map((sig) => (
                        <div key={sig.id} className="animate-in slide-in-from-bottom-4 duration-500">
                            <SignatureCard {...sig} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-3xl bg-accent/5 transition-colors hover:bg-accent/10">
                    {isFetching && localOwnedIds.length === 0 ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Checking ownership records...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-background p-6 rounded-full shadow-xl mb-6">
                                <PackageOpen className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">No signatures found</h3>
                            <p className="text-muted-foreground mb-8 text-center max-w-md px-6">
                                You haven't acquired any signatures yet.
                            </p>
                            <Button  className="rounded-xl px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 cursor-pointer">
                                Explore Marketplace
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

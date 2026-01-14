import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    // CheckCircle2,
    AlertCircle,
    ExternalLink,
    Copy,
    MoreVertical,
    Wallet,
    ShieldCheck,
    ArrowUpRight
} from "lucide-react";
import { useWaitForTransactionReceipt, useAccount, useWriteContract, useBalance } from "wagmi";
import { MARKETPLACE_ABI } from "@/abi/marketplace";
import { parseEther } from "viem";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { MARKETPLACE_ADDRESS } from "@/config/contracts";

interface SignatureCardProps {
    id: string;
    name: string;
    artist: string;
    price: string; // e.g., "0.25 ETH"
    imageUrl: string;
}

const getIPFSUrl = (uri: string) => {
    if (uri.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${uri.split("ipfs://")[1]}`;
    }
    return uri;
};

export default function SignatureCard({
    id,
    name,
    artist,
    price,
    imageUrl,
}: SignatureCardProps) {
    const { address, isConnected, chain } = useAccount();
    const { data: balanceData } = useBalance({
        address: address,
    });
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // contract write hook
    const { writeContractAsync, isPending: isWriting } = useWriteContract();

    // wait for transaction receipt hook
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: txError
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(() => {
        if (typeof window !== 'undefined') {
            const purchased = JSON.parse(localStorage.getItem('purchased_nfts') || '[]');
            return purchased.includes(id) ? 'success' : 'idle';
        }
        return 'idle';
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isWriting || isConfirming) {
            setStatus('processing');
        } else if (isConfirmed) {
            setStatus('success');
            // Persist purchase to localStorage for fallback UI
            const purchased = JSON.parse(localStorage.getItem('purchased_nfts') || '[]');
            if (!purchased.includes(id)) {
                purchased.push(id);
                localStorage.setItem('purchased_nfts', JSON.stringify(purchased));
                console.log(`Successfully saved NFT ${id} to localStorage`);
            }
        } else if (txError) {
            setStatus('error');
            const timer = setTimeout(() => setStatus('idle'), 6000);
            return () => clearTimeout(timer);
        }
    }, [isWriting, isConfirming, isConfirmed, txError, id]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBuy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isConnected) {
            alert('Please connect your wallet first!');
            return;
        }

        if (chain?.id !== 11155111) {
            alert("Please switch your network to Sepolia to purchase NFTs.");
            return;
        }

        const numericPrice = price.split(' ')[0] || '0';
        const tokenId = BigInt(id);
        const ethValue = parseEther(numericPrice);

        if (balanceData && balanceData.value < ethValue) {
            alert(`Insufficient balance. You need at least ${price} to buy this NFT.`);
            return;
        }

        console.log('Buying via marketplace', { tokenId, ethValue: ethValue.toString() });

        try {
            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'buyNFT',
                args: [tokenId],
                value: ethValue,
            });
            setTxHash(hash);
        } catch (err: any) {
            console.error('Marketplace purchase error:', err);
            setStatus('error');
            setErrorMsg(err.shortMessage || err.message || "Transaction failed");
        }
    };

    return (
        <div className={`group relative flex flex-col h-full overflow-hidden hover:cursor-pointer rounded-2xl bg-card border transition-all duration-500 ${status === 'success'
            ? 'border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/10'
            : status === 'error'
                ? 'border-red-500/50 bg-red-500/5'
                : 'border-border hover:bg-accent/5 hover:border-primary/50'
            }`}>
            <div className="relative flex-1 min-h-[300px] overflow-hidden">
                <img
                    src={getIPFSUrl(imageUrl)}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${status === 'processing' ? 'scale-105 blur-[2px]' : 'group-hover:scale-110'
                        }`}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Advanced Status Overlays */}
                {status === 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md z-20">
                        <div className="flex flex-col items-center gap-4 px-6 text-center animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <div className="bg-primary/10 p-4 rounded-full border border-primary/20 relative">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-lg text-foreground tracking-tight">
                                    {isConfirming ? "Confirming..." : "Awaiting Wallet"}
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
                                    Check your **MetaMask** for the transaction popup.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-xl z-20 transition-all duration-700">
                        <div className="flex flex-col items-center gap-4 px-6 text-center animate-in zoom-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-green-500 p-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-foreground tracking-tight italic">Piece Acquired</h4>
                                <p className="text-xs text-muted-foreground">
                                    Track live status in your wallet.
                                </p>
                            </div>

                            {/* Improved Redirection Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-background/50 border-green-500/30 text-green-600 hover:bg-green-500 hover:text-white transition-all rounded-full px-4">
                                        Transaction Info <MoreVertical className="ml-2 w-3 h-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-56 rounded-xl border-border/50 backdrop-blur-lg">
                                    <DropdownMenuItem className="cursor-pointer gap-2 py-2.5" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}>
                                        <ExternalLink className="w-4 h-4" /> View on Etherscan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer gap-2 py-2.5" onClick={() => txHash && copyToClipboard(txHash)}>
                                        <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Tx Hash"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer gap-2 py-2.5" onClick={() => window.open('https://metamask.io/', '_blank')}>
                                        <Wallet className="w-4 h-4" /> Open MetaMask
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-md z-20">
                        <div className="flex flex-col items-center gap-4 px-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-red-500/20 p-4 rounded-full border border-red-500/30">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-1">
                                <span className="font-bold text-red-500/80 uppercase tracking-widest underline decoration-red-500/30 underline-offset-4">Transaction Interrupted</span>
                                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 max-w-[200px] mt-1 italic">
                                    {errorMsg || (txError as any)?.shortMessage || txError?.message || "Verify your wallet balance and connection."}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setStatus('idle')} className="text-[10px] hover:bg-red-500/10 text-red-500 hover:text-red-600">
                                Dismiss
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-card-foreground truncate">{name}</h3>
                    <span className="text-primary font-bold text-sm">{price}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
                    by <span className="text-foreground font-medium">{artist}</span>
                </p>

                <Button
                    variant={status === 'success' ? 'secondary' : 'outline'}
                    onClick={handleBuy}
                    disabled={status === 'processing' || status === 'success'}
                    className={`group/btn w-full h-12 border-border/60 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500 rounded-xl font-medium relative overflow-hidden ${status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/50' : ''
                        } ${status === 'error' ? 'border-red-500/50 text-red-500' : ''}`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {status === 'idle' && (
                            <>
                                Buy now <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </>
                        )}
                        {status === 'error' && "Retry Transaction"}
                        {status === 'processing' && (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isConfirming ? "Confirming..." : "Check Wallet..."}</span>
                            </>
                        )}
                        {status === 'success' && (
                            <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Owned</span>
                            </>
                        )}
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                </Button>
            </div>
        </div>
    );
}

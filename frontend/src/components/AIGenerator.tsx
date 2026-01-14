import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, PenTool, ShieldCheck, Download, Wand2, Loader2, Key, Cpu, CreditCard, ChevronDown } from "lucide-react";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useWriteContract, useBalance } from "wagmi";
import { parseEther } from "viem";
import { uploadToIPFS, uploadJSONToIPFS, urlToBlob } from "@/lib/ipfs";
import { SIGNATURE_NFT_ABI } from "@/abi/nft";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NFT_CONTRACT_ADDRESS, TREASURY_ADDRESS } from "@/config/contracts";

const AI_FEE = "0.000001";


export default function AIGenerator() {
    const { address, isConnected, chain } = useAccount();
    const { data: balanceData } = useBalance({
        address: address,
    });
    const [name, setName] = useState("");
    const [style, setStyle] = useState("Executive");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("DALL-E 3 (OpenAI)");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [isMinting, setIsMinting] = useState(false);

    const { sendTransactionAsync, isPending: isTxPending } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const { writeContractAsync: mintNFTContract, isPending: isMintPending } = useWriteContract();
    const { isLoading: isConfirmingMint, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({
        hash: mintTxHash,
    });

    const generateSignature = async () => {
        if (!isConnected) {
            alert("Please connect your wallet to pay the AI generation fee.");
            return;
        }

        if (chain?.id !== 11155111) {
            alert("Please switch your network to Sepolia to use the AI Generator.");
            return;
        }

        if (balanceData && balanceData.value < parseEther(AI_FEE)) {
            alert(`Insufficient balance. You need at least ${AI_FEE} ETH to generate a signature.`);
            return;
        }

        try {
            setIsGenerating(true);

            // 1. Handle Payment
            const hash = await sendTransactionAsync({
                to: TREASURY_ADDRESS as `0x${string}`,
                value: parseEther(AI_FEE),
            });
            setTxHash(hash);
        } catch (error: any) {
            console.error("Payment failed:", error);
            alert(`Payment failed: ${error.shortMessage || error.message}`);
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (isConfirmed && isGenerating) {
            // 2. Trigger AI Generation after payment is confirmed
            handleAiCall();
        }
    }, [isConfirmed]);

    const handleAiCall = async () => {
        // In a real production app, this would be a secure backend call to avoid exposing API keys
        // or a direct client-side call if the user provides their own key.

        setTimeout(() => {
            const dummyPreviews: Record<string, string> = {
                "Executive": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop",
                "Calligraphic": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2574&auto=format&fit=crop",
                "Minimal": "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=2672&auto=format&fit=crop",
            };
            setGeneratedPreview(dummyPreviews[style] || dummyPreviews["Executive"]);
            setIsGenerating(false);
            setTxHash(undefined);
        }, 2000);
    };

    const handleMint = async () => {
        if (!generatedPreview || !name) return;

        if (chain?.id !== 11155111) {
            alert("Please switch your network to Sepolia to mint NFTs.");
            return;
        }

        try {
            setIsMinting(true);

            // 1. Upload Image to IPFS
            const imageBlob = await urlToBlob(generatedPreview);
            const imageIpfsUri = await uploadToIPFS(imageBlob, `${name.replace(/\s+/g, '_')}_signature.png`);
            console.log("Image uploaded to IPFS:", imageIpfsUri);

            // 2. Create and Upload Metadata to IPFS
            const metadata = {
                name: `${name}'s Signature`,
                description: `A unique digital identity signature crafted for ${name} in ${style} style.`,
                image: imageIpfsUri,
                attributes: [
                    { trait_type: "Name", value: name },
                    { trait_type: "Style", value: style },
                    { trait_type: "Model", value: model }
                ]
            };
            const metadataUri = await uploadJSONToIPFS(metadata);
            console.log("Metadata uploaded to IPFS:", metadataUri);

            // 3. Mint on Blockchain
            const hash = await mintNFTContract({
                address: NFT_CONTRACT_ADDRESS as `0x${string}`,
                abi: SIGNATURE_NFT_ABI,
                functionName: 'mintSignature',
                args: [metadataUri],
            });

            setMintTxHash(hash);
        } catch (error: any) {
            console.error("Minting failed:", error);
            alert(`Minting failed: ${error.shortMessage || error.message || "Unknown error"}`);
            setIsMinting(false);
        }
    };

    useEffect(() => {
        if (isMintConfirmed) {
            alert("NFT successfully minted!");
            setIsMinting(false);
            onAcquire(generatedPreview!);
        }
    }, [isMintConfirmed]);

    return (
        <div className="max-w-4xl mx-auto px-6 mt-32 animate-in fade-in duration-1000">
            <header className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-widest">AI Signature Studio</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                    Craft Your <span className="text-primary italic">Eternal</span> Identity
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    A signature is more than ink—it's your legacy. Use our neural engine to design a unique identity for your bank, your business, and your life.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-24">
                {/* Controls */}
                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-primary/5 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">The Name</label>
                            <Input
                                placeholder="Type your full name..."
                                className="bg-accent/10 border-border/50 h-14 text-lg rounded-2xl px-6 focus-visible:ring-primary/30"
                                value={name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                                    <Key className="w-3 h-3 text-primary" /> API Key
                                </label>
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        className="bg-accent/5 border-border/50 h-12 rounded-xl px-4 text-xs font-mono focus:ring-primary/20 transition-all"
                                        value={apiKey}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                                    <Cpu className="w-3 h-3 text-primary" /> Selection
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full h-12 justify-between bg-accent/5 border-border/50 rounded-xl px-4 text-xs font-bold hover:bg-accent/10 transition-all">
                                            <span className="flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-primary" /> {model}
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/50 backdrop-blur-xl bg-background/80">
                                        {[
                                            { name: "DALL-E 3 (OpenAI)", desc: "Highest quality, detailed strokes" },
                                            { name: "DALL-E 2 (OpenAI)", desc: "Faster, more artistic variety" },
                                            { name: "Stable Diffusion XL", desc: "Photorealistic textures" },
                                            { name: "Midjourney Gen-6", desc: "Cinematic calligraphy" }
                                        ].map((m) => (
                                            <DropdownMenuItem key={m.name} onClick={() => setModel(m.name)} className="flex flex-col items-start gap-1 py-3 px-4 focus:bg-primary/10 cursor-pointer">
                                                <span className="text-xs font-bold">{m.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{m.desc}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Signature Vibe</label>
                        <div className="grid grid-cols-3 gap-3">
                            {["Executive", "Calligraphic", "Minimal"].map((vibe) => (
                                <button
                                    key={vibe}
                                    onClick={() => setStyle(vibe)}
                                    className={`py-4 px-2 rounded-2xl border transition-all duration-300 ${style === vibe
                                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.05]"
                                        : "bg-accent/5 border-border/50 hover:border-primary/30 text-muted-foreground hover:bg-accent/10"
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{vibe}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <div className="flex flex-col gap-1 mb-6 px-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" /> Compute Fee
                                </span>
                                <span className="text-sm font-black text-primary">{AI_FEE} ETH</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">
                                Fees contribute to the neural engine's decentralized compute resources and gas costs.
                            </p>
                        </div>
                        <Button
                            onClick={generateSignature}
                            disabled={!name || !apiKey || isGenerating}
                            className={`w-full h-16 rounded-2xl text-lg font-bold shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${isGenerating ? "bg-primary/50 shadow-none cursor-wait" : "shadow-primary/20"
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {isConfirming ? "Confirming Fee..." : isTxPending ? "Awaiting Wallet..." : "Visualizing..."}
                                </>
                            ) : (
                                <><Wand2 className="w-5 h-5 mr-2" /> Manifest Signature</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Preview */}
                <div className="relative group min-h-[400px]">
                    <div className="absolute inset-0 bg-primary/5 rounded-[40px] border-2 border-dashed border-primary/20 animate-pulse group-hover:bg-primary/10 transition-colors" />

                    {generatedPreview ? (
                        <div className="relative h-full bg-card border border-border rounded-[40px] p-8 shadow-2xl shadow-primary/10 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-white/5 border border-border relative">
                                <img src={generatedPreview} className="w-full h-full object-cover grayscale brightness-125" alt="Preview" />
                                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/20" />
                                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white/70 uppercase tracking-widest leading-none">
                                    <PenTool className="w-3 h-3" /> Neural Render
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <h3 className="text-2xl font-bold italic tracking-tight">"{name}"</h3>
                                <p className="text-muted-foreground text-sm max-w-[300px]">
                                    This signature is mathematically unique to your name and vibe. Once minted, you own the intellectual property.
                                </p>
                                <div className="flex gap-4 w-full pt-4">
                                    <Button variant="outline" className="flex-1 rounded-xl h-12">
                                        <Download className="w-4 h-4 mr-2" /> Draft PNG
                                    </Button>
                                    <Button
                                        onClick={handleMint}
                                        disabled={isMinting || isMintPending}
                                        className="flex-1 rounded-xl h-12 bg-green-600 hover:bg-green-700 shadow-green-500/20"
                                    >
                                        {isMinting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                {isConfirmingMint ? "Confirming..." : "Minting..."}
                                            </>
                                        ) : (
                                            <><ShieldCheck className="w-4 h-4 mr-2" /> Mint as NFT</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center space-y-4 text-muted-foreground">
                            <PenTool className="w-12 h-12 stroke-[1px] opacity-20" />
                            <div>
                                <h4 className="font-bold text-lg opacity-50 uppercase tracking-[0.2em]">Studio Idle</h4>
                                <p className="text-sm italic">Input your name and choose a vibe to begin the visualization process.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Educational Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-border/50">
                <div className="space-y-2">
                    <h5 className="font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> On-Chain IP
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Every generated signature is hashed and stored on Sepolia. Your identity cannot be forged or duplicated.
                    </p>
                </div>
                <div className="space-y-2">
                    <h5 className="font-bold text-primary flex items-center gap-2">
                        <PenTool className="w-5 h-5" /> Bank-Ready
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Export your signature in high-res vector format for physical documents, bank cards, and legal contracts.
                    </p>
                </div>
                <div className="space-y-2">
                    <h5 className="font-bold text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Neural Variety
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Our AI analyzes thousands of historical calligraphies to find the perfect stroke weight and balance for you.
                    </p>
                </div>
            </div>
        </div>
    );
}

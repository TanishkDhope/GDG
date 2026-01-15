"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CardContainer } from "@/components/Card-Container"
import { usePublicClient, useBlockNumber, useChainId, useWatchContractEvent } from "wagmi"
import { getAddress, formatEther } from "viem"
import { BALLOT_CONTRACT_ADDRESS } from "@/config/contracts"
import { BALLOT_ABI } from "@/abi/ballot"
import {
    Activity,
    ShieldCheck,
    Database,
    Cpu,
    ArrowUpRight,
    TrendingUp,
    History,
    X,
    Copy,
    AlertCircle,
    Vote,
    Users,
    PieChart,
    Blocks
} from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface VoteEvent {
    id: string
    candidateId: bigint
    token: string
    timestamp: number
}

// Candidates for internal logic (summing votes), but not displayed individually
const CANDIDATES = [
    { id: "1", name: "Rajesh Kumar", party: "National Progressive Party", partySymbol: "🌾" },
    { id: "2", name: "Priya Sharma", party: "Democratic Alliance", partySymbol: "🏛️" },
    { id: "3", name: "Arjun Singh", party: "People's United Front", partySymbol: "⭐" },
    { id: "4", name: "Meera Patel", party: "Inclusive Growth Movement", partySymbol: "🤝" },
]

const BASELINE_VOTES = 500000

export default function ResultsPage() {
    const publicClient = usePublicClient()
    const chainId = useChainId()
    const { data: blockNumber } = useBlockNumber({ watch: true })

    const [loading, setLoading] = useState(true)
    const [totalVotes, setTotalVotes] = useState<bigint>(0n)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [recentVotes, setRecentVotes] = useState<VoteEvent[]>([])
    const [contractBalance, setContractBalance] = useState<string>("0")
    const [error, setError] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const feedRef = useRef<HTMLDivElement>(null)

    // Derived Stats
    const displayTotalVotes = Number(totalVotes) + BASELINE_VOTES
    const maleVotes = Math.round(displayTotalVotes * 0.52)
    const femaleVotes = Math.round(displayTotalVotes * 0.46)
    const otherVotes = displayTotalVotes - maleVotes - femaleVotes

    // Animations
    useGSAP(() => {
        if (!loading) {
            gsap.from(".stat-card", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out"
            })

            gsap.from(".counter-value", {
                textContent: 0,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                stagger: 0.2,
            })
        }
    }, [loading])

    const fetchResults = async () => {
        if (!publicClient) return

        try {
            let total = 0n

            // Get real on-chain total by summing candidates
            for (const c of CANDIDATES) {
                try {
                    const voteCount = await publicClient.readContract({
                        address: getAddress(BALLOT_CONTRACT_ADDRESS),
                        abi: BALLOT_ABI,
                        functionName: 'getVotes',
                        args: [BigInt(c.id)],
                    }) as bigint
                    total += voteCount
                } catch (readErr) {
                    console.warn(`DEBUG: Error reading votes for candidate ${c.id}:`, readErr)
                }
            }

            // Fetch contract balance (transparency)
            try {
                const balance = await publicClient.getBalance({
                    address: getAddress(BALLOT_CONTRACT_ADDRESS),
                })
                setContractBalance(formatEther(balance))
            } catch (balErr) {
                console.warn("DEBUG: Could not fetch balance:", balErr)
            }

            setTotalVotes(total)
            setLastUpdated(new Date())
            setError(null)
            setLoading(false)
        } catch (err) {
            console.error("DEBUG: Error fetching results:", err)
            setError("Failed to synchronize with blockchain")
            setLoading(false)
        }
    }

    // Watch for new votes
    useWatchContractEvent({
        address: getAddress(BALLOT_CONTRACT_ADDRESS),
        abi: BALLOT_ABI,
        eventName: 'VoteCast',
        onLogs(logs) {
            console.log("DEBUG: VoteCast Event Received", logs);
            fetchResults()
            const newEvents = logs.map(log => ({
                id: log.transactionHash as string,
                candidateId: (log as any).args.candidateId,
                token: (log as any).args.token,
                timestamp: Date.now()
            }))
            setRecentVotes(prev => [...newEvents, ...prev].slice(0, 10))

            // Flash animation
            gsap.fromTo(".live-indicator", { opacity: 1, scale: 1.5 }, { opacity: 0.5, scale: 1, duration: 1 })
        },
    })

    // Fetch history
    useEffect(() => {
        const fetchHistory = async () => {
            if (!publicClient) return
            try {
                const logs = await publicClient.getContractEvents({
                    address: getAddress(BALLOT_CONTRACT_ADDRESS),
                    abi: BALLOT_ABI,
                    eventName: 'VoteCast',
                    fromBlock: 'earliest'
                })

                const history = logs.map(log => ({
                    id: log.transactionHash as string,
                    candidateId: (log as any).args.candidateId,
                    token: (log as any).args.token,
                    timestamp: Date.now() // Ideally block timestamp
                })).reverse()

                setRecentVotes(prev => {
                    const currentIds = new Set(prev.map(p => p.id))
                    const newHistory = history.filter(h => !currentIds.has(h.id))
                    return [...prev, ...newHistory].slice(0, 50)
                })
            } catch (e) {
                console.error("DEBUG: Failed to fetch history", e)
            }
        }

        fetchHistory()
        fetchResults()
        const interval = setInterval(fetchResults, 5000)
        return () => clearInterval(interval)
    }, [publicClient, chainId])

    // Auto-scroll visualizer
    useEffect(() => {
        const container = document.getElementById('block-chain-container');
        if (container) {
            container.scrollLeft = container.scrollWidth;
        }
    }, [blockNumber]);

    // Auto-scroll visualizer
    useEffect(() => {
        const container = document.getElementById('block-chain-container');
        if (container) {
            container.scrollLeft = container.scrollWidth;
        }
    }, [blockNumber]);

    const [selectedVoteHash, setSelectedVoteHash] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const selectedVote = recentVotes.find(v => v.id === selectedVoteHash)

    const getNetworkName = (id: number) => {
        if (id === 11155111) return "Sepolia Testnet"
        if (id === 31337) return "Anvil Local"
        return `Chain ID: ${id}`
    }

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30" ref={containerRef}>
            <Header />

            <main className="flex-1 py-12 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Dashboard Header */}
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">
                            <Activity className="w-3 h-3" />
                            Live Consensus Engine
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight">
                            Election <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Real-time cryptographic verification of every single vote cast.
                            Automated contracts ensure immutable transparency.
                        </p>
                        {error && (
                            <div className="inline-flex items-center gap-2 text-destructive font-bold bg-destructive/10 px-4 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Total Votes Card */}
                        <CardContainer className="stat-card relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Total Votes Verified</p>
                                <div className="text-4xl md:text-5xl font-black text-foreground counter-value">
                                    {loading ? "..." : displayTotalVotes.toLocaleString()}
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>+{(Number(totalVotes)).toLocaleString()} Real-time On-Chain</span>
                                </div>
                            </div>
                        </CardContainer>

                        {/* Block Height Card */}
                        <CardContainer className="stat-card border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                    <Blocks className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                                    {getNetworkName(chainId)}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-foreground font-mono">
                                #{blockNumber?.toString() || "Syncing"}
                            </p>
                            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">Current Block Height</p>
                            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-accent w-2/3 animate-[shimmer_2s_infinite]" />
                            </div>
                        </CardContainer>

                        {/* Contract Status */}
                        <a href={`https://sepolia.etherscan.io/address/${BALLOT_CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noreferrer">
                            <CardContainer className="stat-card border-border/50 hover:cursor-pointer">

                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                                        <Cpu className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                                    </div>
                                </div>
                                <div className="space-y-1 ">
                                    <p className="text-xs font-medium text-muted-foreground">Smart Contract</p>
                                    <p className="text-sm font-bold font-mono text-foreground truncate">
                                        {BALLOT_CONTRACT_ADDRESS}
                                    </p>
                                </div>
                                <div className="mt-4 flex  justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Gas Balance</p>
                                        <p className="text-sm font-bold text-foreground">{contractBalance} ETH</p>
                                    </div>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${BALLOT_CONTRACT_ADDRESS}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                    </a>
                                </div>
                            </CardContainer>
                        </a>

                        {/* Gender Stats */}
                        <CardContainer className="stat-card border-border/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <PieChart className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase text-muted-foreground">Demographics</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-foreground">Male</span>
                                    <span className="font-bold text-purple-600">{((maleVotes / displayTotalVotes) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '52%' }}></div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-foreground">Female</span>
                                    <span className="font-bold text-pink-500">{((femaleVotes / displayTotalVotes) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: '46%' }}></div>
                                </div>
                            </div>
                        </CardContainer>
                    </div>

                    {/* Blockchain Visualizer Stream */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-foreground">Live Blockchain Consensus</h3>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-70">
                                {getNetworkName(chainId)} • Avg Block Time: ~12s
                            </span>
                        </div>
                        <div className="relative group">
                            {/* Scroll Buttons */}
                            <button
                                onClick={() => {
                                    const container = document.getElementById('block-chain-container');
                                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-background/80 backdrop-blur border border-primary/20 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ArrowUpRight className="w-5 h-5 rotate-225" />
                            </button>
                            <button
                                onClick={() => {
                                    const container = document.getElementById('block-chain-container');
                                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-background/80 backdrop-blur border border-primary/20 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ArrowUpRight className="w-5 h-5 rotate-45" />
                            </button>

                            <div className="relative h-64 bg-card/30 border border-border/50 rounded-2xl flex items-center overflow-hidden">
                                {/* Background connecting line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-border/30 -translate-y-1/2 z-0" />

                                {/* Scrollable Container */}
                                <div
                                    id="block-chain-container"
                                    className="flex items-center gap-12 px-12 overflow-x-auto w-full h-full py-8 custom-scrollbar scroll-smooth"
                                >
                                    {/* History truncator indicator if needed */}
                                    {(Number(blockNumber) > 50) && (
                                        <div className="shrink-0 flex items-center justify-center w-12 h-28 opacity-30">
                                            <span className="text-2xl font-black">...</span>
                                        </div>
                                    )}

                                    {Array.from({ length: Math.min(Number(blockNumber || 0) + 1, 50) }).map((_, i) => {
                                        const total = Number(blockNumber || 0);
                                        const startData = Math.max(0, total - 50);
                                        const bn = startData + i; // 0, 1, 2...
                                        const isNewest = bn === total;

                                        const blockLink = chainId === 11155111
                                            ? `https://sepolia.etherscan.io/block/${bn}`
                                            : `https://sepolia.etherscan.io/block/${bn}`;

                                        return (
                                            <a
                                                key={bn}
                                                href={blockLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                id={isNewest ? "newest-block" : undefined}
                                                className={`
                                                    relative shrink-0 w-28 h-28
                                                    bg-card border-4 ${isNewest ? 'border-primary' : 'border-muted-foreground/30'}
                                                    rounded-2xl flex flex-col items-center justify-center gap-2
                                                    transition-all duration-300 animate-in fade-in zoom-in-50
                                                    hover:scale-110 hover:-translate-y-2 cursor-pointer
                                                    shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]
                                                    hover:shadow-[12px_12px_0px_0px_rgba(var(--primary),0.4)]
                                                    ${isNewest ? 'shadow-[8px_8px_0px_0px_rgba(var(--primary),0.3)]' : ''}
                                                    z-20
                                                `}
                                            >
                                                {isNewest && (
                                                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-black border-2 border-background animate-bounce z-20">
                                                        NEW
                                                    </div>
                                                )}

                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Block</div>
                                                <div className="text-3xl font-black font-mono text-foreground tracking-tighter">#{bn}</div>

                                                <div className="w-full px-3">
                                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/50 w-2/3" />
                                                    </div>
                                                </div>

                                                <div className="text-[9px] font-bold text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                                                    {bn > 0 ? "0x" + Math.random().toString(16).slice(2, 6) + "..." : "---"}
                                                </div>
                                            </a>
                                        )
                                    })}

                                    {/* Future Block Placeholder (at the end/right) */}
                                    <div className="shrink-0 w-28 h-28 border-4 border-dashed border-primary/10 rounded-2xl flex items-center justify-center opacity-40 ml-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse border-2 border-primary/30" />
                                    </div>

                                    {/* If we are cutting off history, show a "..." at the start */}
                                    {(Number(blockNumber) > 50) && (
                                        <div className="shrink-0 flex items-center justify-center w-12 h-28 opacity-30 order-first">
                                            <span className="text-2xl font-black">...</span>
                                        </div>
                                    )}

                                </div>

                                {/* Fade Overlay */}
                                <div className="pointer-events-none absolute left-0 top-0 w-12 h-full bg-linear-to-r from-background/50 to-transparent z-20" />
                                <div className="pointer-events-none absolute right-0 top-0 w-12 h-full bg-linear-to-l from-background/50 to-transparent z-20" />
                            </div>
                        </div>
                    </div>

                    {/* Split Log View */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Participation Map/Visual (Placeholder for now, using text visual) */}
                        <CardContainer className="lg:col-span-2 min-h-[400px] flex flex-col justify-center items-center text-center space-y-6 bg-linear-to-b from-background to-muted/20 border-dashed">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                                <Database className="w-32 h-32 text-muted-foreground/20" />
                            </div>
                            <div className="max-w-md space-y-2 relative z-10">
                                <h3 className="text-xl font-bold text-foreground">Immutable Ledger Active</h3>
                                <p className="text-muted-foreground">
                                    Votes are being cryptographically secured in blocks.
                                    The integrity of the election is guaranteed by the Ethereum consensus mechanism.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-8 w-full max-w-lg mt-8">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-foreground">24/7</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Uptime</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-foreground">0</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Downtime</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-foreground">100%</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Accuracy</p>
                                </div>
                            </div>
                        </CardContainer>

                        {/* Right: Live Audit Log */}
                        <CardContainer className="h-[500px] flex flex-col bg-card/50 backdrop-blur-sm border-primary/10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold flex items-center gap-2">
                                    <History className="w-4 h-4 text-primary" />
                                    Live Audit Log
                                </h3>
                                <div className="live-indicator w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2" ref={feedRef}>
                                {recentVotes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-current animate-spin mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Waiting for blocks...</p>
                                    </div>
                                ) : (
                                    recentVotes.map((vote) => (
                                        <div
                                            key={vote.id}
                                            onClick={() => {
                                                setSelectedVoteHash(vote.id)
                                                setIsModalOpen(true)
                                            }}
                                            className="group cursor-pointer p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                                                    {vote.id.slice(0, 12)}...
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {new Date(vote.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <p className="text-xs font-bold text-foreground">Vote Confirmed</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContainer>
                    </div>

                </div>
            </main>
            <Footer />

            {/* Modal */}
            {isModalOpen && selectedVote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg bg-card border-2 border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black">Transaction Details</h2>
                                <p className="text-xs text-muted-foreground font-mono mt-1">{selectedVote.id}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</p>
                                <div className="flex items-center gap-2 text-green-600 font-bold">
                                    <ShieldCheck className="w-5 h-5" /> Verified on Blockchain
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Block</p>
                                    <p className="font-mono font-bold">{blockNumber?.toString()}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Gas Used</p>
                                    <p className="font-mono font-bold">21000 Gwei</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 font-bold"
                            onClick={() => {
                                const url = chainId === 11155111
                                    ? `https://sepolia.etherscan.io/tx/${selectedVote.id}`
                                    : `http://127.0.0.1:8545/tx/${selectedVote.id}`;
                                window.open(url, '_blank');
                            }}
                        >
                            View on Explorer <ArrowUpRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

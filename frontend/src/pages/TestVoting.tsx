import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileJson, Loader2, CheckCircle, Vote } from 'lucide-react';
import { generateCircuitInput } from '../lib/circuitGenerator';
import * as snarkjs from "snarkjs";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ZK_VOTING_ABI } from '@/abi/ZKVoting';
import { ZK_VOTING_ADDRESS } from '@/config/contracts';
import { v4 as uuidv4 } from 'uuid';

import {
  cacheVote,
  getCachedVotes,
  markVoteSynced,
} from '@/lib/voteCache';

const TestVoting = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [proofData, setProofData] = useState<any>(null);
    const [candidateId, setCandidateId] = useState<string>('1');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    
    const { writeContractAsync, isPending: isVoting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: !!txHash }
    });

    // Handle online/offline status
    useEffect(() => {
        const updateStatus = () => setIsOffline(!navigator.onLine);
        
        // Set initial status
        setIsOffline(!navigator.onLine);
        
        // Add event listeners
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    const syncCachedVotes = async () => {
        const cachedVotes = await getCachedVotes();

        for (const vote of cachedVotes) {
            if (vote.synced) continue;

            try {
                const txHash = await writeContractAsync({
                    address: ZK_VOTING_ADDRESS as `0x${string}`,
                    abi: ZK_VOTING_ABI,
                    functionName: 'vote',
                    args: [
                        vote.proofData.a,
                        vote.proofData.b,
                        vote.proofData.c,
                        vote.proofData.input,
                        BigInt(vote.candidateId),
                    ],
                });

                await markVoteSynced(vote.id);
                console.log('Vote synced:', txHash);
            } catch (err) {
                console.error('Failed to sync vote:', vote.id, err);
            }
        }
    };

    useEffect(() => {
        if (!isOffline) {
            syncCachedVotes();
        }
    }, [isOffline]);

    const handleGenerateInput = async () => {
        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            // Generate circuit input locally in the frontend
            const data = await generateCircuitInput();
            setResult(data);
            console.log(data.circuitInput);
            
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                data.circuitInput,
                "/voterCircuit.wasm",
                "/voterCircuit_final.zkey"
            );
            console.log('Proof:', proof);
            console.log('Public Signals:', publicSignals);

            const calldata = await snarkjs.groth16.exportSolidityCallData(
                proof,
                publicSignals
            );
            const argv = JSON.parse("[" + calldata + "]");

            const a = argv[0];
            const b = argv[1];
            const c = argv[2];
            const input = argv[3];

            // Store proof data for voting
            setProofData({ a, b, c, input });
            
            await cacheVote({
                id: uuidv4(),
                timestamp: Date.now(),
                candidateId,
                electionId: data.circuitInput.election_id,
                proofData: { a, b, c, input },
                synced: false,
            });

            console.log('Proof data ready for voting:', { a, b, c, input });

        } catch (err: any) {
            console.error('Error generating input:', err);
            setError(err.message || 'Failed to generate circuit input.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVote = async () => {
        if (!proofData) {
            setError('Please generate proof first');
            return;
        }

        try {
            setError(null);
            const hash = await writeContractAsync({
                address: ZK_VOTING_ADDRESS as `0x${string}`,
                abi: ZK_VOTING_ABI,
                functionName: 'vote',
                args: [proofData.a, proofData.b, proofData.c, proofData.input, BigInt(candidateId)],
            });
            setTxHash(hash);
            console.log('Vote transaction submitted:', hash);
        } catch (err: any) {
            console.error('Voting error:', err.message || err);
            setError(err.shortMessage || err.message || 'Failed to submit vote.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Test Voting Circuit</h1>
                            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                                Generate test circuit inputs for zero-knowledge proof verification
                            </p>
                            <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Click the button below to generate input.json with Merkle tree proofs and voter credentials.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Main Content Section */}
                <section className="py-16 md:py-24">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            {/* Offline Status Indicator */}
                            {isOffline && (
                                <div className="p-3 mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-700">
                                    You are offline. Your vote will be securely cached and synced later.
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                                <FileJson className="h-16 w-16 text-primary mx-auto" />
                                <h2 className="text-2xl font-bold text-foreground">Generate Circuit Input</h2>
                                <p className="text-muted-foreground">
                                    This will create a new input.json file with:
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto text-left">
                                    <li>• Identity secret (voter credential)</li>
                                    <li>• Merkle tree commitment</li>
                                    <li>• Merkle proof path elements and indices</li>
                                    <li>• Election ID</li>
                                </ul>

                                <Button
                                    onClick={handleGenerateInput}
                                    disabled={isGenerating}
                                    className="w-full max-w-md mx-auto font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md mt-6"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileJson className="mr-2 h-4 w-4" />
                                            Generate input.json
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-in">
                                    {error}
                                </div>
                            )}

                            {/* Success Result */}
                            {result && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="h-6 w-6 text-primary" />
                                        <h3 className="text-xl font-semibold text-primary">Input Generated Successfully!</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Identity Secret</p>
                                            <p className="font-mono bg-background p-2 rounded text-sm text-foreground break-all">
                                                {result.circuitInput?.identity_secret || result.identity_secret}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Commitment</p>
                                            <p className="font-mono bg-background p-2 rounded text-sm text-foreground break-all">
                                                {result.commitment}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Merkle Root</p>
                                            <p className="font-mono bg-background p-2 rounded text-sm text-foreground break-all">
                                                {result.circuitInput?.merkle_root || result.merkle_root}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Election ID</p>
                                            <p className="font-mono bg-background p-2 rounded text-sm text-foreground break-all">
                                                {result.circuitInput?.election_id || result.election_id}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Leaf Index</p>
                                            <p className="font-mono bg-background p-2 rounded text-sm text-foreground break-all">
                                                {result.leafIndex}
                                            </p>
                                        </div>

                                        <details className="mt-4">
                                            <summary className="cursor-pointer text-sm font-semibold text-primary hover:text-primary/80">
                                                View Full Circuit Input JSON
                                            </summary>
                                            <pre className="mt-2 p-4 bg-background border border-border rounded text-xs overflow-x-auto">
                                                {JSON.stringify(result.circuitInput || result, null, 2)}
                                            </pre>
                                        </details>

                                        <Button
                                            onClick={() => {
                                                const dataStr = JSON.stringify(result.circuitInput, null, 2);
                                                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                                const url = URL.createObjectURL(dataBlob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = 'input.json';
                                                link.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="w-full bg-secondary text-secondary-foreground hover:bg-muted border border-border"
                                            variant="secondary"
                                        >
                                            <FileJson className="mr-2 h-4 w-4" />
                                            Download input.json
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Voting Section */}
                            {proofData && (
                                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Vote className="h-6 w-6 text-primary" />
                                        <h3 className="text-xl font-semibold text-foreground">Cast Your Vote</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Candidate ID</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={candidateId}
                                                onChange={(e) => setCandidateId(e.target.value)}
                                                placeholder="Enter candidate ID"
                                                className="w-full"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleVote}
                                            disabled={isVoting || isConfirming || isConfirmed}
                                            className="w-full font-semibold"
                                        >
                                            {isVoting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Confirm in Wallet...
                                                </>
                                            ) : isConfirming ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Confirming Transaction...
                                                </>
                                            ) : isConfirmed ? (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Vote Submitted!
                                                </>
                                            ) : (
                                                <>
                                                    <Vote className="mr-2 h-4 w-4" />
                                                    Submit Vote with ZK Proof
                                                </>
                                            )}
                                        </Button>

                                        {isConfirmed && txHash && (
                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                <p className="text-sm font-semibold text-green-600 mb-2">Vote Successfully Cast!</p>
                                                <p className="text-xs text-muted-foreground break-all">
                                                    Transaction: {txHash}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TestVoting;
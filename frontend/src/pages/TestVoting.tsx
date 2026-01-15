import { useState, useEffect } from 'react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileJson, Loader2, CheckCircle, Vote } from 'lucide-react';
import { generateCircuitInput } from '../lib/circuitGenerator';
import * as snarkjs from "snarkjs";
import {Header} from '@/components/Header';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { ZK_VOTING_ABI } from '@/abi/ZKVoting';
import { ZK_VOTING_ADDRESS } from '@/config/contracts';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import {
    cacheVote,
    getCachedVotes,
    markVoteSynced,
} from '@/lib/voteCache';

interface Candidate {
    _id: string;
    srNo: string;
    name: string;
    party: string;
    icon: string;
    education: string;
    legalHistory?: {
        pendingCases: number;
        convictions: number;
    };
    isReservedSeat: boolean;
    reservedCategory: string;
}

const TestVoting = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [proofData, setProofData] = useState<any>(null);
    const [candidateId, setCandidateId] = useState<string>('');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [identitySecret, setIdentitySecret] = useState<string>('');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [merkleRootTxHash, setMerkleRootTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [isUpdatingMerkleRoot, setIsUpdatingMerkleRoot] = useState(false);

    const { address } = useAccount();

    const { writeContractAsync, isPending: isVoting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: !!txHash }
    });
    const { isLoading: isMerkleRootConfirming, isSuccess: isMerkleRootConfirmed } = useWaitForTransactionReceipt({
        hash: merkleRootTxHash,
        query: { enabled: !!merkleRootTxHash }
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

    // Fetch candidates from backend
    useEffect(() => {
        const fetchCandidates = async () => {
            setLoadingCandidates(true);
            try {
                const response = await axios.get('http://localhost:8000/api/v1/candidates');
                setCandidates(response.data.data || []);
                console.log('Candidates loaded:', response.data.data);
            } catch (err) {
                console.error('Failed to fetch candidates:', err);
                setError('Failed to load candidates. Please refresh the page.');
            } finally {
                setLoadingCandidates(false);
            }
        };

        fetchCandidates();
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
        if (!identitySecret || identitySecret.trim() === '') {
            setError('Please enter your identity secret');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            // Generate circuit input with user's secret
            const data = await generateCircuitInput(identitySecret);
            setResult(data);
            console.log(data.circuitInput)

            // Update merkle root on contract if user is connected
            if (address) {
                try {
                    setIsUpdatingMerkleRoot(true);
                    console.log('Updating merkle root on contract:', data.merkle_root);

                    // Convert merkle root string to bytes32
                    const merkleRootBigInt = BigInt(data.merkle_root);
                    const merkleRootBytes32 = '0x' + merkleRootBigInt.toString(16).padStart(64, '0') as `0x${string}`;

                    const hash = await writeContractAsync({
                        address: ZK_VOTING_ADDRESS as `0x${string}`,
                        abi: ZK_VOTING_ABI,
                        functionName: 'updateMerkleRoot',
                        args: [merkleRootBytes32],
                    });
                    setMerkleRootTxHash(hash);
                    console.log('✅ Merkle root updated on contract:', hash);
                } catch (merkleErr: any) {
                    console.error('Warning: Failed to update merkle root on contract:', merkleErr);
                    // Don't throw - allow user to continue with proof generation
                } finally {
                    setIsUpdatingMerkleRoot(false);
                }
            }

            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                data.circuitInput,
                "/voterCircuit.wasm",
                "/voterCircuit_final.zkey"
            );
            console.log('✅ Proof generated');
            console.log('📊 Public Signals from circuit:', publicSignals);
            console.log('Circuit outputs: [merkle_root, nullifier, election_id]');
            console.log('- Signal [0] (merkle_root):', publicSignals[0]);
            console.log('- Signal [1] (nullifier):', publicSignals[1]);
            console.log('- Signal [2] (election_id):', publicSignals[2]);

            // Swap election_id and nullifier (circuit outputs them in wrong order)
            const correctedPublicSignals = [
                publicSignals[0], // merkle_root (correct position)
                publicSignals[2], // nullifier (was at index 2, should be at index 1)
                publicSignals[1]  // election_id (was at index 1, should be at index 2)
            ];

            console.log('📊 Corrected Public Signals:', correctedPublicSignals);
            console.log('Expected: [merkle_root, election_id, nullifier]');
            console.log('- Public Signal [0] (merkle_root):', correctedPublicSignals[0]);
            console.log('- Public Signal [1] (election_id):', correctedPublicSignals[1]);
            console.log('- Public Signal [2] (nullifier):', correctedPublicSignals[2]);
            console.log('Expected nullifier from circuit input:', data.nullifier);

            const calldata = await snarkjs.groth16.exportSolidityCallData(
                proof,
                publicSignals
            );
            const argv = JSON.parse("[" + calldata + "]");

            const a = argv[0];
            const b = argv[1];
            const c = argv[2];
            const input = argv[3];

            console.log('📝 Calldata input array:', input);
            console.log('This should be [merkle_root, election_id, nullifier]');
            console.log('Input array length:', input.length);

            if (input.length !== 3) {
                throw new Error(`Invalid input array length: expected 3, got ${input.length}`);
            }

            if (input[2] === '1') {
                console.warn('⚠️ WARNING: Nullifier is 1 (election_id), not the computed nullifier!');
                console.warn('This means public signals may be in wrong order or circuit output is incorrect');
            }

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
            console.log(proofData)
            const hash = await writeContractAsync({
                address: ZK_VOTING_ADDRESS as `0x${string}`,
                abi: ZK_VOTING_ABI,
                functionName: 'vote',
                args: [proofData.a, proofData.b, proofData.c, proofData.input, BigInt(candidateId)],
            });
            setTxHash(hash);
            console.log('Vote transaction submitted:', hash);
        } catch (err: any) {
            console.error('Voting error:', err);
            setError(err.shortMessage || err.message || 'Failed to submit vote.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header showNav={false} />

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
                            {/* Candidate Selection */}
                            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Vote className="h-6 w-6 text-primary" />
                                    <h3 className="text-xl font-semibold text-foreground">Select Candidate</h3>
                                </div>

                                {loadingCandidates ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading candidates...
                                    </div>
                                ) : candidates.length === 0 ? (
                                    <p className="text-sm text-destructive">No candidates available</p>
                                ) : (
                                    <div className="space-y-2">
                                        {candidates.map((candidate) => (
                                            <label
                                                key={candidate._id}
                                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${candidateId === candidate.srNo
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="candidate"
                                                    value={candidate.srNo}
                                                    checked={candidateId === candidate.srNo}
                                                    onChange={(e) => setCandidateId(e.target.value)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-xl">
                                                        {candidate.icon || "👤"}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-foreground">{candidate.name}</p>
                                                        <p className="text-sm text-muted-foreground">{candidate.party}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    ID: {candidate.srNo}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TestVoting;
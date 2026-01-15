import { useState, useEffect } from 'react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileJson, Loader2, CheckCircle, Vote } from 'lucide-react';
import { generateCircuitInput, getVoterProof } from '../lib/circuitGenerator';
import * as snarkjs from "snarkjs";
import { Header } from '@/components/Header';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { ZK_VOTING_ABI } from '@/abi/ZKVoting';
import { ZK_VOTING_ADDRESS } from '@/config/contracts';
import { v4 as uuidv4 } from 'uuid';
import { loadLatestVoterCredentials } from '@/lib/identityStore';
import axios from 'axios';
import { parseContractError } from '@/lib/utils';

import {
    cacheVote,
    getCachedVotes,
    markVoteSynced,
} from '@/lib/voteCache';

interface Candidate {
    _id: string;
    srNo: string;
    candidateId: number;
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

    const { writeContractAsync, isPending: isVoting, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError, error: txError } = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: !!txHash }
    });
    const { isLoading: isMerkleRootConfirming, isSuccess: isMerkleRootConfirmed } = useWaitForTransactionReceipt({
        hash: merkleRootTxHash,
        query: { enabled: !!merkleRootTxHash }
    });

    // Handle transaction errors from useWaitForTransactionReceipt
    useEffect(() => {
        if (isTxError && txError) {
            setError(parseContractError(txError));
        }
    }, [isTxError, txError]);

    // Handle write contract errors  
    useEffect(() => {
        if (writeError) {
            setError(parseContractError(writeError));
        }
    }, [writeError]);

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
    // load saved credentials from IndexedDB on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const creds = await loadLatestVoterCredentials();
                if (!mounted) return;
                if (creds) {
                    setIdentitySecret(creds.identitySecret);
                    // show merkle + leaf on UI so user sees registration
                    setResult({
                        circuitInput: {
                            identity_secret: creds.identitySecret,
                            merkle_root: creds.merkleRoot,
                            election_id: creds.electionId ?? '1',
                            pathElements: creds.pathElements,
                            pathIndices: creds.pathIndices,
                        },
                        leafIndex: creds.leafIndex,
                        commitment: undefined,
                        totalVoters: undefined,
                    });
                    console.log('Loaded voter credentials from IndexedDB:', creds);
                }
            } catch (err) {
                console.warn('Failed to load credentials from IndexedDB', err);
            }
        })();
        return () => { mounted = false; };
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
                const errorMsg = parseContractError(err);
                console.error('Failed to sync vote:', vote.id, errorMsg);
                setError(`Sync failed: ${errorMsg}`);
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
            setError(parseContractError(err));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVote = async () => {
        if (!identitySecret || identitySecret.trim() === '') {
            setError('Please enter your identity secret');
            return;
        }

        if (!candidateId) {
            setError('Please select a candidate');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Fetch existing voter proof (does NOT add to tree again)
            console.log('🔍 Fetching voter proof...');
            const data = await getVoterProof(identitySecret);

            console.log('✅ Voter verified - generating ZK proof...');

            // Generate ZK proof
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                data.circuitInput,
                "/voterCircuit.wasm",
                "/voterCircuit_final.zkey"
            );

            console.log('✅ ZK Proof generated');
            console.log('📊 Public Signals:', publicSignals);

            // Export calldata
            const calldata = await snarkjs.groth16.exportSolidityCallData(
                proof,
                publicSignals
            );
            const argv = JSON.parse("[" + calldata + "]");

            const a = argv[0];
            const b = argv[1];
            const c = argv[2];
            const input = argv[3];

            console.log('📝 Calldata ready:', { a, b, c, input });

            // Submit vote to blockchain
            console.log('📤 Submitting vote to blockchain...');
            const hash = await writeContractAsync({
                address: ZK_VOTING_ADDRESS as `0x${string}`,
                abi: ZK_VOTING_ABI,
                functionName: 'vote',
                args: [a, b, c, input, BigInt(candidateId)],
            });

            setTxHash(hash);
            console.log('✅ Vote submitted:', hash);

            // Cache vote for offline sync
            await cacheVote({
                id: uuidv4(),
                timestamp: Date.now(),
                candidateId: candidateId.toString(),
                electionId: data.election_id,
                proofData: { a, b, c, input },
                synced: true,
            });

        } catch (err: any) {
            console.error('Voting error:', err);
            setError(parseContractError(err));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header showNav={false} />

            <main className="flex-1">

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

                                                    value={candidate.candidateId}
                                                    checked={candidateId === candidate.candidateId}
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

                            {/* Identity Secret Input */}
                            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Identity Secret
                                    </label>
                                    <Input
                                        type="password"
                                        value={identitySecret}
                                        onChange={(e) => setIdentitySecret(e.target.value)}
                                        placeholder="Enter your identity secret"
                                        className="w-full font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enter the secret from your voter credentials file
                                    </p>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Vote Button */}
                            <Button
                                onClick={handleVote}
                                disabled={isGenerating || isVoting || isConfirming || isConfirmed || !candidateId || !identitySecret}
                                className="w-full font-semibold h-12 text-base"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating Proof...
                                    </>
                                ) : isVoting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Confirm in Wallet...
                                    </>
                                ) : isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Confirming Transaction...
                                    </>
                                ) : isConfirmed ? (
                                    <>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Vote Submitted!
                                    </>
                                ) : (
                                    <>
                                        <Vote className="mr-2 h-5 w-5" />
                                        Submit Vote
                                    </>
                                )}
                            </Button>

                            {/* Success Display */}
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
                </section>
            </main>
        </div>
    );
};

export default TestVoting;
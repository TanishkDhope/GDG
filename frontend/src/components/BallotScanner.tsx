import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BallotData } from '../lib/gemini';
import { uploadJSONToIPFS } from '../lib/ipfs';
import { Loader2, CheckCircle, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { keccak256, toHex, getAddress } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { BALLOT_REGISTRY_ABI } from '../abi/ballotRegistry';
import { BALLOT_REGISTRY_ADDRESS } from '../config/contracts';

const BallotScanner = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [jsonText, setJsonText] = useState("");
    const [batchData, setBatchData] = useState<BallotData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Form State
    const [data, setData] = useState<BallotData | null>(null);
    const [electionId, setElectionId] = useState<string>("");

    // Results
    const [ipfsHash, setIpfsHash] = useState<string | null>(null);
    const [computedBallotHash, setComputedBallotHash] = useState<string | null>(null);
    const [batchHash, setBatchHash] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const { isConnected, address } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync, isPending: isWriting } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: txError
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Removed fileInputRef as it was for UI Scan mode

    // Auto-calculate hash whenever name or srNo changes
    useEffect(() => {
        if (data && data.name && data.srNo) {
            try {
                const combined = `${data.name}${data.srNo}`;
                const hash = keccak256(toHex(combined));
                setComputedBallotHash(hash);
            } catch (e) {
                console.error("Hashing error", e);
            }
        } else {
            setComputedBallotHash(null);
        }
    }, [data?.name, data?.srNo]);

    // Calculate Batch Hash whenever batchData changes
    useEffect(() => {
        if (batchData && batchData.length > 0) {
            try {
                // Hash of the entire JSON array
                const jsonStr = JSON.stringify(batchData);
                const hash = keccak256(toHex(jsonStr));
                setBatchHash(hash);
            } catch (e) {
                console.error("Batch hashing error", e);
            }
        } else {
            setBatchHash(null);
        }
    }, [batchData]);

    // Removed handleFileChange and handleScan as they were for the AI Scan mode

    const handleJsonImport = () => {
        try {
            setError(null);
            const parsed = JSON.parse(jsonText);

            let ballots: any[] = Array.isArray(parsed) ? parsed : [parsed];

            if (ballots.length === 0) throw new Error("JSON array is empty");

            // Validate all items briefly
            ballots.forEach((b, idx) => {
                if (!b.name || !b.srNo) {
                    throw new Error(`Item ${idx + 1} is missing 'name' or 'srNo'`);
                }
            });

            const formattedBallots: BallotData[] = ballots.map(b => ({
                srNo: b.srNo?.toString() || "",
                name: b.name || "",
                icon: b.icon || "Not specified",
                party: b.party || "Not specified",
                isSigned: !!b.isSigned,
                isValid: typeof b.isValid === 'boolean' ? b.isValid : true,
                confidence: b.confidence || 1.0,
                notes: b.notes || (Array.isArray(parsed) ? "Batch Import" : "Manual Entry")
            }));

            setBatchData(formattedBallots);
            setCurrentIndex(0);
            setData(formattedBallots[0]);
        } catch (err: any) {
            setError("Invalid JSON format: " + err.message);
        }
    };

    const nextBallot = () => {
        if (currentIndex < batchData.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setData(batchData[newIndex]);
        }
    };

    const prevBallot = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setData(batchData[newIndex]);
        }
    };

    const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setJsonText(content);
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleFieldChange = (field: keyof BallotData, value: any) => {
        if (!data) return;
        const updatedData = {
            ...data,
            [field]: value
        };
        setData(updatedData);

        // Sync back to batchData if we are in batch mode (or even single item batch)
        if (batchData.length > 0) {
            const updatedBatch = [...batchData];
            updatedBatch[currentIndex] = updatedData;
            setBatchData(updatedBatch);
        }
    };

    const handleUpload = async () => {
        if (batchData.length === 0 && !data) return;
        if (!electionId) {
            setError("Please enter an Election ID");
            return;
        }

        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        try {
            setIsUploading(true);
            setError(null);

            // Prepare the full batch to upload
            const uploadData = batchData.length > 0 ? batchData : [data!];

            // Add electionId to each item
            const finalBatch = uploadData.map(item => ({
                ...item,
                electionId
            }));

            // 1. PRE-FLIGHT SIMULATION
            // Check if transaction is likely to succeed (admin check, election ID check)
            // We use a dummy IPFS hash for simulation
            try {
                console.log("DEBUG: Running pre-flight simulation...");
                await publicClient?.simulateContract({
                    address: getAddress(BALLOT_REGISTRY_ADDRESS),
                    abi: BALLOT_REGISTRY_ABI,
                    functionName: 'storeBallot',
                    args: [BigInt(electionId), (batchHash || "0x0") as `0x${string}`, "ipfs://simulation-placeholder"],
                    account: address,
                });
                console.log("DEBUG: Simulation successful!");
            } catch (simErr: any) {
                console.error("DEBUG: Simulation failed:", simErr);
                const reason = simErr.shortMessage || simErr.message || "Simulation failed";

                if (reason.includes("Only admin")) {
                    setError("Unauthorized: Only the contract admin can upload ballots.");
                } else if (reason.includes("already stored")) {
                    setError(`Error: Election ID ${electionId} has already been registered on-chain.`);
                } else {
                    setError(`Transaction would fail: ${reason}`);
                }
                return;
            }

            // 2. Upload the WHOLE array to IPFS (Only if simulation passed)
            setIsUploading(true); // Re-affirming loading state for IPFS
            const ipfsUri = await uploadJSONToIPFS(finalBatch);
            setIpfsHash(ipfsUri);

            // 2. Calculate batch hash from the same data being uploaded
            const jsonStr = JSON.stringify(finalBatch);
            const calculatedBatchHash = keccak256(toHex(jsonStr));
            setBatchHash(calculatedBatchHash);

            // 3. Trigger Smart Contract Transaction
            const hash = await writeContractAsync({
                address: BALLOT_REGISTRY_ADDRESS as `0x${string}`,
                abi: BALLOT_REGISTRY_ABI,
                functionName: 'storeBallot',
                args: [BigInt(electionId), calculatedBatchHash as `0x${string}`, ipfsUri],
            });
            setTxHash(hash);
        } catch (err: any) {
            console.error("Upload/Contract error:", err);
            setError(err.shortMessage || err.message || "Failed to complete process.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="container mx-auto px-4 pt-8 max-w-5xl">
                <h1 className="text-3xl font-bold mb-2">Gov Admin: Ballot Scanner</h1>
                <p className="text-muted-foreground mb-8">Upload verified ballot scans to digitize and secure them on IPFS.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Input Method */}
                    <div className="space-y-6">
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">Direct JSON Import</h2>
                                    <label className="text-xs text-primary cursor-pointer hover:underline">
                                        Upload JSON File
                                        <input type="file" accept=".json" className="hidden" onChange={handleJsonFileChange} />
                                    </label>
                                </div>
                                <textarea
                                    className="w-full h-80 p-4 rounded-xl border border-border bg-card font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder={`{
  "srNo": "1",
  "name": "John Doe",
  "icon": "Lotus",
  "party": "Example Party",
  "isSigned": true,
  "isValid": true
}`}
                                    value={jsonText}
                                    onChange={(e) => setJsonText(e.target.value)}
                                />
                                <Button
                                    onClick={handleJsonImport}
                                    disabled={!jsonText}
                                    className="w-full font-semibold bg-secondary text-secondary-foreground hover:bg-muted border border-border"
                                    variant="secondary"
                                >
                                    Import & Preview Data
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-in">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Form & Actions */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Election ID (uint256)</label>
                            <Input
                                placeholder="e.g. 101"
                                value={electionId}
                                onChange={(e) => setElectionId(e.target.value)}
                                type="number"
                            />
                        </div>

                        {data ? (
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        Review Extracted Data
                                    </h3>
                                    {batchData.length > 1 && (
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={prevBallot} disabled={currentIndex === 0}>
                                                &larr;
                                            </Button>
                                            <span className="text-xs font-mono">{currentIndex + 1} / {batchData.length}</span>
                                            <Button variant="ghost" size="sm" onClick={nextBallot} disabled={currentIndex === batchData.length - 1}>
                                                &rarr;
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="col-span-1 space-y-1">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Sr. No</label>
                                            <Input
                                                value={data.srNo}
                                                onChange={(e) => handleFieldChange('srNo', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Candidate Name</label>
                                            <Input
                                                value={data.name}
                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Party Icon</label>
                                            <Input
                                                value={data.icon}
                                                onChange={(e) => handleFieldChange('icon', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Party Name</label>
                                            <Input
                                                value={data.party || ''}
                                                onChange={(e) => handleFieldChange('party', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 border border-border p-3 rounded bg-card">
                                            <input
                                                type="checkbox"
                                                checked={data.isSigned}
                                                onChange={(e) => handleFieldChange('isSigned', e.target.checked)}
                                                className="h-4 w-4 accent-primary"
                                            />
                                            <span className="text-sm text-foreground">Signed?</span>
                                        </div>
                                        <div className="flex items-center gap-2 border border-border p-3 rounded bg-card">
                                            <input
                                                type="checkbox"
                                                checked={data.isValid}
                                                onChange={(e) => handleFieldChange('isValid', e.target.checked)}
                                                className="h-4 w-4 accent-primary"
                                            />
                                            <span className="text-sm text-foreground">Valid?</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-muted rounded text-xs font-mono text-foreground">
                                        Confidence: {(data.confidence * 100).toFixed(1)}% <br />
                                        Notes: {data.notes || 'None'}
                                    </div>

                                    {computedBallotHash && (
                                        <div className="p-3 bg-primary/10 border border-primary/20 rounded text-xs break-all">
                                            <span className="font-semibold text-primary block mb-1">Generated Ballot Hash (bytes32):</span>
                                            <span className="font-mono text-foreground">{computedBallotHash}</span>
                                            <p className="text-[10px] text-muted-foreground mt-1">Keccak256(name + srNo)</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                                    onClick={handleUpload}
                                    disabled={isUploading || isWriting || isConfirming || isConfirmed}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading to IPFS...
                                        </>
                                    ) : isWriting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Confirm in Wallet...
                                        </>
                                    ) : isConfirming ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying On-Chain...
                                        </>
                                    ) : isConfirmed ? (
                                        <>
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Success!
                                        </>
                                    ) : 'Push to Blockchain'}
                                </Button>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl p-8 bg-card">
                                Import JSON data to verify here
                            </div>
                        )}

                        {isConfirmed && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-green-600">Ballot Batch Secured</p>
                                    <p className="text-xs text-muted-foreground">The batch hash and IPFS metadata are now permanently recorded on the blockchain.</p>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-primary underline flex items-center gap-1 mt-2"
                                    >
                                        View Transaction <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {txError && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Transaction Failed</p>
                                    <p className="text-xs opacity-80">{(txError as any)?.shortMessage || txError.message}</p>
                                </div>
                            </div>
                        )}

                        {ipfsHash && isConfirmed && (
                            <div className="bg-primary/10 border border-primary/20 text-foreground p-4 rounded-xl break-all space-y-4">
                                <h3 className="font-semibold text-lg text-primary">Metadata Details</h3>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Election ID (uint256)</p>
                                    <p className="font-mono bg-background p-2 rounded text-foreground">{electionId}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Batch Hash (bytes32)</p>
                                    <p className="font-mono bg-background p-2 rounded text-xs text-foreground">{batchHash}</p>
                                    <p className="text-[10px] text-muted-foreground italic">Keccak256 of the whole JSON array</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">IPFS Hash (string)</p>
                                    <p className="font-mono bg-background p-2 rounded text-xs text-foreground">{ipfsHash}</p>
                                </div>

                                <a
                                    href={ipfsHash.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary underline block mt-2 text-right hover:text-primary/80"
                                >
                                    View Metadata on Gateway
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BallotScanner

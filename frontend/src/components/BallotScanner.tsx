import React, { useState, useEffect } from 'react';
import { AdminNavbar } from './AdminNavbar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BallotData } from '../lib/gemini';
import { uploadJSONToIPFS } from '../lib/ipfs';
import {
    Loader2,
    CheckCircle,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    FileJson,
    Upload,
    ScanLine,
    Hash,
    Calendar,
    Stamp,
    UserCheck,
    XCircle
} from 'lucide-react';
import { keccak256, toHex, getAddress } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { BALLOT_REGISTRY_ABI } from '../abi/ballotRegistry';
import { BALLOT_REGISTRY_ADDRESS } from '../config/contracts';
import { CardContainer } from '@/components/Card-Container';

const BallotScanner = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [jsonText, setJsonText] = useState("");
    const [batchData, setBatchData] = useState<BallotData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [electionId, setElectionId] = useState<string>("");
    const [pollDate, setPollDate] = useState<string>("");

    // Results
    const [ipfsHash, setIpfsHash] = useState<string | null>(null);
    const [computedBallotHash, setComputedBallotHash] = useState<string | null>(null);
    const [batchHash, setBatchHash] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const { isConnected, address } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync, isPending: isWriting } = useWriteContract();

    // Form State
    const [data, setData] = useState<BallotData | null>(null);

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: txError
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

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
        if (!pollDate) {
            setError("Please select a Poll Date");
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

            // Add electionId and pollDate to each item
            const finalBatch = uploadData.map(item => ({
                ...item,
                electionId,
                pollDate: new Date(pollDate).toISOString() // Standardize format
            }));

            // 1. PRE-FLIGHT SIMULATION
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
            setIsUploading(true);
            const ipfsUri = await uploadJSONToIPFS(finalBatch);
            setIpfsHash(ipfsUri);

            // 3. Calculate batch hash from the same data being uploaded
            const jsonStr = JSON.stringify(finalBatch);
            const calculatedBatchHash = keccak256(toHex(jsonStr));
            setBatchHash(calculatedBatchHash);

            // 4. Trigger Smart Contract Transaction
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
        <div className="min-h-screen bg-[#f8fafc] pb-12">
                                                                                                                                                                                                                                <AdminNavbar />
{/* 
            <div className="bg-[#1e293b] text-white py-12 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>                                     
                <div className="container mx-auto p                                                                                                                                                                                                     x-4 max-w-6xl relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="p-2 bg-white/10 rounded-lg">
                            <ScanLine className="h-6 w-6 text-primary-foreground" />
                        </span>
                        <h1 className="text-3xl font-bold">Ballot Scanner & Digitizer</h1>
                    </div>
                    <p className="text-slate-300 max-w-2xl ml-12">
                        Securely import, verify, and digitize physical ballot data.
                        This tool creates an immutable record on the blockchain.
                    </p>
                </div>
            </div> */}

            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                    {/* Left Column: Input Method */}
                    <div className="lg:col-span-5 space-y-6">
                        <CardContainer className="bg-white border-slate-200 shadow-sm h-full">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <FileJson className="h-5 w-5 text-primary" />
                                    <h2 className="font-semibold">Data Import</h2>
                                </div>
                                <label className="text-xs flex items-center gap-1 text-primary cursor-pointer hover:underline bg-primary/5 px-2 py-1 rounded border border-primary/20 transition-colors hover:bg-primary/10">
                                    <Upload className="h-3 w-3" />
                                    Upload JSON
                                    <input type="file" accept=".json" className="hidden" onChange={handleJsonFileChange} />
                                </label>
                            </div>

                            <div className="relative group">
                                <textarea
                                    className="w-full h-[500px] p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-600 transition-all focus:bg-white focus:shadow-inner"
                                    placeholder={`{
  "srNo": "1",
  "name": "Candidate Name",
  "icon": "Symbol",
  "party": "Party Name",
  "isSigned": true,
  "isValid": true
}`}
                                    value={jsonText}
                                    onChange={(e) => setJsonText(e.target.value)}
                                />
                                {jsonText && (
                                    <div className="absolute top-2 right-2 text-[10px] text-slate-400 bg-white px-2 py-1 rounded border shadow-sm">
                                        JSON Format
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleJsonImport}
                                disabled={!jsonText}
                                className="w-full mt-4 font-semibold"
                                variant={jsonText ? "default" : "secondary"}
                            >
                                <ScanLine className="w-4 h-4 mr-2" />
                                Process & Verify Data
                            </Button>
                        </CardContainer>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm animate-in fade-in flex items-start gap-3 shadow-sm">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Validation Error</p>
                                    <p className="opacity-90">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Verification & Upload */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Control Panel */}
                        <div className="grid grid-cols-2 gap-4">
                            <CardContainer className="bg-white border-slate-200 py-3 px-4 shadow-sm">
                                <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1 mb-1">
                                    <Hash className="h-3 w-3" /> Election ID
                                </label>
                                <Input
                                    placeholder="Enter ID..."
                                    value={electionId}
                                    onChange={(e) => setElectionId(e.target.value)}
                                    type="number"
                                    className="border-0 p-0 h-auto text-lg font-mono font-bold placeholder:text-slate-300 focus-visible:ring-0 text-slate-700"
                                />
                            </CardContainer>
                            <CardContainer className="bg-white border-slate-200 py-3 px-4 shadow-sm">
                                <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1 mb-1">
                                    <Calendar className="h-3 w-3" /> Poll Date
                                </label>
                                <Input
                                    type="date"
                                    value={pollDate}
                                    onChange={(e) => setPollDate(e.target.value)}
                                    className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0 text-slate-700"
                                />
                            </CardContainer>
                        </div>

                        {data ? (
                            <div className="space-y-6">
                                {/* Digital Ballot Card */}
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden relative animate-in fade-in slide-in-from-bottom-2">
                                    {/* Header Pattern */}
                                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    Ballot Verification
                                                    {data.isValid && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full uppercase tracking-wide border border-green-200">
                                                            Valid
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-slate-500">Review the digitized data before blockchain submission</p>
                                            </div>

                                            {batchData.length > 1 && (
                                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                                    <Button variant="ghost" size="sm" onClick={prevBallot} disabled={currentIndex === 0} className="h-7 w-7 p-0">
                                                        &larr;
                                                    </Button>
                                                    <span className="text-xs font-mono font-medium px-2 text-slate-600">
                                                        {currentIndex + 1} / {batchData.length}
                                                    </span>
                                                    <Button variant="ghost" size="sm" onClick={nextBallot} disabled={currentIndex === batchData.length - 1} className="h-7 w-7 p-0">
                                                        &rarr;
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-12 gap-6">
                                            {/* Left: SR No */}
                                            <div className="col-span-3">
                                                <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Sr. No</label>
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center h-24">
                                                    <input
                                                        value={data.srNo}
                                                        onChange={(e) => handleFieldChange('srNo', e.target.value)}
                                                        className="text-3xl font-bold text-center bg-transparent w-full focus:outline-none text-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            {/* Right: Candidate Details */}
                                            <div className="col-span-9 space-y-4">
                                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                                    <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Candidate Name</label>
                                                    <input
                                                        value={data.name}
                                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                                        className="text-xl font-bold bg-transparent w-full focus:outline-none text-slate-800 border-b border-transparent focus:border-primary/50 transition-colors"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                                        <label className="text-[10px] font-semibold uppercase text-slate-400 mb-1 block">Party Name</label>
                                                        <input
                                                            value={data.party || ''}
                                                            onChange={(e) => handleFieldChange('party', e.target.value)}
                                                            className="text-sm font-medium bg-transparent w-full focus:outline-none text-slate-700"
                                                        />
                                                    </div>
                                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                                        <label className="text-[10px] font-semibold uppercase text-slate-400 mb-1 block">Party Symbol</label>
                                                        <input
                                                            value={data.icon}
                                                            onChange={(e) => handleFieldChange('icon', e.target.value)}
                                                            className="text-sm font-medium bg-transparent w-full focus:outline-none text-slate-700"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Checks */}
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.isSigned ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'}`}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.isSigned ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {data.isSigned && <Stamp className="w-3 h-3" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={data.isSigned}
                                                    onChange={(e) => handleFieldChange('isSigned', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm font-medium ${data.isSigned ? 'text-blue-700' : 'text-slate-500'}`}>
                                                    Officially Signed
                                                </span>
                                            </label>

                                            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.isValid ? 'border-green-500 bg-green-50/50' : 'border-slate-200'}`}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.isValid ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {data.isValid && <ShieldCheck className="w-3 h-3" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={data.isValid}
                                                    onChange={(e) => handleFieldChange('isValid', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm font-medium ${data.isValid ? 'text-green-700' : 'text-slate-500'}`}>
                                                    Vote Valid
                                                </span>
                                            </label>
                                        </div>

                                        {/* Hash Display */}
                                        {computedBallotHash && (
                                            <div className="mt-6 p-3 bg-slate-900 rounded-lg text-xs font-mono group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <Hash className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">Generated Ballot Hash</span>
                                                <span className="text-green-400 break-all">{computedBallotHash}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            Confidence Score: <span className="font-bold text-slate-700">{(data.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={isUploading || isWriting || isConfirming || isConfirmed}
                                            className="px-6 font-semibold shadow-md hover:shadow-lg transition-all"
                                            size="lg"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : isWriting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sign Wallet...
                                                </>
                                            ) : isConfirming ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Confirming...
                                                </>
                                            ) : isConfirmed ? (
                                                <>
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Secured
                                                </>
                                            ) : 'Push to Blockchain'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                <ScanLine className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-medium">Waiting for data...</p>
                                <p className="text-sm">Import JSON from the left panel to begin verification</p>
                            </div>
                        )}

                        {/* Success Receipt */}
                        {isConfirmed && ipfsHash && (
                            <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">Ballot Batch Secured</h3>
                                            <p className="text-xs text-slate-500">Immutable record created on blockchain</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-400 uppercase block mb-1">Items</span>
                                            <span className="font-mono font-medium text-slate-700">{batchData.length || 1} Ballots</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-400 uppercase block mb-1">Batch Hash</span>
                                            <span className="font-mono font-medium text-slate-700 truncate block">{batchHash?.slice(0, 10)}...</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full text-xs" size="sm">
                                                <ExternalLink className="w-3 h-3 mr-2" />
                                                View Transaction
                                            </Button>
                                        </a>
                                        <a href={ipfsHash.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} target="_blank" rel="noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full text-xs" size="sm">
                                                <ExternalLink className="w-3 h-3 mr-2" />
                                                View IPFS Metadata
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BallotScanner;

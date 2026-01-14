import React, { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { extractBallotData, BallotData } from '../lib/gemini';
import { uploadJSONToIPFS } from '../lib/ipfs';
import { Loader2, Upload, FileJson, CheckCircle } from 'lucide-react';
import { keccak256, toHex } from 'viem';

const BallotScanner = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [mode, setMode] = useState<'scan' | 'json'>('scan');
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
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setData(null);
            setIpfsHash(null);
            setComputedBallotHash(null);

            // Create preview URL
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const handleScan = async () => {
        if (!file) return;

        try {
            setIsScanning(true);
            setError(null);

            const extracted = await extractBallotData(file);
            setData(extracted);
            // Ensure batchData has the newly scanned item
            setBatchData([extracted]);
            setCurrentIndex(0);
        } catch (err: any) {
            console.error("Scan error:", err);
            setError(err.message || "Failed to scan ballot.");
        } finally {
            setIsScanning(false);
        }
    };

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

        try {
            setIsUploading(true);

            // Prepare the full batch to upload
            const uploadData = batchData.length > 0 ? batchData : [data!];

            // Add electionId to each item if not already present or to ensure consistency
            const finalBatch = uploadData.map(item => ({
                ...item,
                electionId
            }));

            // Upload the WHOLE array to IPFS
            const ipfsUri = await uploadJSONToIPFS(finalBatch);
            setIpfsHash(ipfsUri);
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload to IPFS.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />

            <div className="container mx-auto px-4 pt-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Gov Admin: Ballot Scanner</h1>
                <p className="text-muted-foreground mb-8">Upload verified ballot scans to digitize and secure them on IPFS.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Input Method */}
                    <div className="space-y-6">
                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <button
                                onClick={() => setMode('scan')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'scan' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                            >
                                AI Scan
                            </button>
                            <button
                                onClick={() => setMode('json')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'json' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                            >
                                Direct JSON
                            </button>
                        </div>

                        {mode === 'scan' ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div
                                    className="border-2 border-dashed border-input rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors h-64 overflow-hidden relative"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="application/pdf,image/*"
                                        onChange={handleFileChange}
                                    />

                                    {previewUrl ? (
                                        file?.type.startsWith('image/') ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FileJson className="h-12 w-12 text-primary mb-2" />
                                                <span className="text-sm font-medium">{file?.name}</span>
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                            <p className="text-sm font-medium">Click to upload Ballot (PDF or Image)</p>
                                            <p className="text-xs text-muted-foreground mt-1">Supports PDF, PNG, JPG</p>
                                        </>
                                    )}
                                </div>

                                <Button
                                    onClick={handleScan}
                                    disabled={!file || isScanning}
                                    className="w-full font-semibold shadow-lg shadow-primary/20"
                                >
                                    {isScanning ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing with AI...
                                        </>
                                    ) : (
                                        'Scan & Extract Data'
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Paste Ballot JSON</label>
                                        <label className="text-xs text-primary cursor-pointer hover:underline">
                                            Upload JSON File
                                            <input type="file" accept=".json" className="hidden" onChange={handleJsonFileChange} />
                                        </label>
                                    </div>
                                    <textarea
                                        className="w-full h-64 p-4 rounded-xl border border-border bg-card font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                        Import JSON Data
                                    </Button>
                                </div>
                            </div>
                        )}

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
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : 'Verify & Upload to IPFS'}
                                </Button>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl p-8 bg-card">
                                Scan a document to verify data here
                            </div>
                        )}

                        {ipfsHash && (
                            <div className="bg-primary/10 border border-primary/20 text-foreground p-4 rounded-xl break-all space-y-4">
                                <h3 className="font-semibold text-lg text-primary">Ready for Blockchain Transaction</h3>

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
        </div>)
}

export default BallotScanner

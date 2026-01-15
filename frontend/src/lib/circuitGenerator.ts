import { buildPoseidon } from "circomlibjs";

const FIELD_SIZE = BigInt(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

const API_URL = "http://localhost:8000/api/v1";

function randomFieldElement() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    let x = BigInt(
        "0x" +
        Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
    );

    while (x >= FIELD_SIZE) {
        crypto.getRandomValues(bytes);
        x = BigInt(
            "0x" +
            Array.from(bytes)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
        );
    }

    return x;
}

export async function generateCircuitInput(userSecret?: string) {
    const poseidon = await buildPoseidon();

    // 🔐 Identity secret (PRIVATE)
    const identity_secret = userSecret ? BigInt(userSecret) : randomFieldElement();

    console.log("Identity Secret:", identity_secret.toString());

    // Commitment = Poseidon(secret)
    const commitment = poseidon([identity_secret]);
    const commitmentStr = poseidon.F.toObject(commitment).toString();

    console.log("Commitment:", commitmentStr);

    // 🌐 Add commitment to backend merkle tree
    const electionId = 1;

    try {
        const response = await fetch(`${API_URL}/merkle-tree/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                electionId,
                commitment: commitmentStr,
            }),
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            console.log(response)
            let errorMessage = `Server error: ${response.status}`;

            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } else {
                const text = await response.text();
                console.error("Server returned non-JSON response:", text.substring(0, 200));
                errorMessage = `Server error: ${response.status}. Is backend server running on ${API_URL}?`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const treeData = data.data;

        console.log("✅ Commitment added to merkle tree");
        console.log("Merkle Root:", treeData.merkleRoot);
        console.log("Leaf Index:", treeData.leafIndex);
        console.log("Total Commitments:", treeData.totalCommitments);

        // 🗳️ Election ID
        const election_id = BigInt(electionId);

        // Calculate nullifier for display (circuit will compute it internally)
        const nullifier = poseidon([identity_secret, election_id]);
        const nullifierStr = poseidon.F.toObject(nullifier).toString();

        // 🎯 Final circuit input - DO NOT include output signals
        const circuitInput = {
            identity_secret: identity_secret.toString(),
            pathElements: treeData.pathElements,
            pathIndices: treeData.pathIndices,
            merkle_root: treeData.merkleRoot,
            election_id: election_id.toString(),
        };

        console.log("\n✅ Circuit input generated");
        console.log("Nullifier (computed by circuit):", nullifierStr);
        console.log("Input count check:");
        console.log("- identity_secret: 1");
        console.log("- pathElements: " + circuitInput.pathElements.length);
        console.log("- pathIndices: " + circuitInput.pathIndices.length);
        console.log("- merkle_root: 1");
        console.log("- election_id: 1");
        console.log("Total inputs:", 1 + circuitInput.pathElements.length + circuitInput.pathIndices.length + 1 + 1);

        console.log("\n✅ Circuit input generated\n");
        console.log(JSON.stringify(circuitInput, null, 2));

        return {
            success: true,
            identity_secret: identity_secret.toString(),
            commitment: commitmentStr,
            leafIndex: treeData.leafIndex,
            merkle_root: treeData.merkleRoot,
            election_id: election_id.toString(),
            totalVoters: treeData.totalCommitments,
            nullifier: nullifierStr, // For display only
            circuitInput
        };
    } catch (error: any) {
        console.error("Error adding commitment to tree:", error);
        throw new Error(error.message || "Failed to generate circuit input");
    }
}

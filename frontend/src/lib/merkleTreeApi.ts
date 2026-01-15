const API_URL = "http://localhost:3000/api/v1";

// Get current merkle root for election
export async function getMerkleRoot(electionId: number = 1) {
    try {
        const response = await fetch(`${API_URL}/merkle-tree/${electionId}/root`);
        if (!response.ok) {
            throw new Error("Failed to fetch merkle root");
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching merkle root:", error);
        throw error;
    }
}

// Get proof for a specific commitment
export async function getProofForCommitment(
    electionId: number,
    commitment: string
) {
    try {
        const response = await fetch(
            `${API_URL}/merkle-tree/${electionId}/proof/${commitment}`
        );
        if (!response.ok) {
            throw new Error("Commitment not found in merkle tree");
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching proof:", error);
        throw error;
    }
}

// Get all commitments for election
export async function getAllCommitments(electionId: number = 1) {
    try {
        const response = await fetch(
            `${API_URL}/merkle-tree/${electionId}/commitments`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch commitments");
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching commitments:", error);
        throw error;
    }
}

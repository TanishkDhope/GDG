
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Uploads a file (image) to IPFS via Pinata
 * @param file The file to upload
 * @returns The IPFS URI (ipfs://HASH)
 */
export async function uploadToIPFS(file: File | Blob, fileName: string = "signature.png") {
    if (!PINATA_JWT) {
        throw new Error("Pinata JWT not found in environment variables");
    }

    const formData = new FormData();
    formData.append("file", file, fileName);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`IPFS Upload Failed: ${errorData.error || res.statusText}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
}

/**
 * Uploads JSON metadata to IPFS via Pinata
 * @param json The metadata object
 * @returns The IPFS URI (ipfs://HASH)
 */
export async function uploadJSONToIPFS(json: any) {
    if (!PINATA_JWT) {
        throw new Error("Pinata JWT not found in environment variables");
    }

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(json),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`IPFS JSON Upload Failed: ${errorData.error || res.statusText}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
}

/**
 * Helper to convert an image URL to a Blob
 * @param url The image URL
 * @returns A Blob of the image
 */
export async function urlToBlob(url: string): Promise<Blob> {
    const res = await fetch(url);
    return await res.blob();
}

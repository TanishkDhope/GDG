import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";

// Initialize the API client
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Set worker for PDF.js - using a CDN to avoid build configuration issues in simple Vite setups
// Note: In a production app, you might want to copy the worker file to your public assets.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface BallotData {
    srNo: string;
    name: string;
    icon: string;
    // Common fields
    party?: string;
    isSigned: boolean;
    isValid: boolean;
    confidence: number;
    notes?: string;
}

/**
 * Extracts structured extracted data from a Ballot PDF or Image
 */
export async function extractBallotData(file: File): Promise<BallotData> {
    if (!API_KEY) throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY.");

    // Try gemini-1.5-pro as fallback/alternative
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let imageData: string;

    try {
        if (file.type === "application/pdf") {
            imageData = await convertPdfToImage(file);
        } else if (file.type.startsWith("image/")) {
            imageData = await fileToGenerativePart(file);
        } else {
            throw new Error("Unsupported file type. Please upload a PDF or Image (JPEG/PNG).");
        }
    } catch (error: any) {
        throw new Error(`File processing failed: ${error.message}`);
    }

    const prompt = `
    You are an expert OCR and data extraction system for Indian Election Ballot Papers.
    Analyze the attached ballot paper image carefully.
    
    Extract the following information for the CANDIDATE THAT IS MARKED/VOTED FOR:
    - srNo: The Serial Number (e.g. "1", "2").
    - name: The Name of the Candidate.
    - icon: Description of the Party Symbol/Icon (e.g. "Lotus", "Hand", "Elephant", "Bicycle").
    - party: The Political Party Name (if visible).
    - isSigned: boolean, true if a signature is detected at the bottom.
    - isValid: boolean, true if the ballot is properly marked (one candidate) and legible.
    - confidence: A number between 0 and 1.
    - notes: Any warnings.

    Return ONLY the JSON. Do not use markdown formatting.
    `;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageData, mimeType: "image/jpeg" } }
        ]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present (Gemini sometimes adds them)
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as BallotData;
    } catch (e: any) {
        console.error("AI Extraction Failed:", e);
        throw new Error(`AI Extraction failed: ${e.message}`);
    }
}

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:image/xxx;base64, prefix
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function convertPdfToImage(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    if (pdf.numPages === 0) throw new Error("PDF is empty");

    // Get first page only for now
    const page = await pdf.getPage(1);

    // Scale up for better resolution (OCR needs clear text)
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context creation failed");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    await page.render({ canvasContext: context, viewport } as any).promise;

    // Return base64 image data (jpeg is usually smaller and fine for OCR)
    return canvas.toDataURL("image/jpeg", 0.8).split(',')[1];
}

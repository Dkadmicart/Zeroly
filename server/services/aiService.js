// server/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";
import logger from "../utils/logger.js";

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Initialize Upstash Redis
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

/**
 * Helper to fetch image buffer from URL
 */
async function fetchImageBuffer(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Analyzes an image using Gemini Vision to auto-fill listing details.
 */
export const analyzeItemImage = async (imageUrl, imageBase64) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key missing");
        
        logger.debug('Analyzing image with Gemini');
        
        // Fetch the image from Cloudinary URL if base64 is not provided
        let buffer;
        if (imageBase64) {
            // Remove data URI prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            buffer = Buffer.from(base64Data, 'base64');
        } else if (imageUrl) {
            buffer = await fetchImageBuffer(imageUrl);
        } else {
            throw new Error("Either imageUrl or imageBase64 must be provided");
        }
        
        // Use gemini-1.5-flash as it is fast and supports multimodal
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
        Analyze this image of an item someone is listing on a community reuse/donation platform.
        Return ONLY a JSON object with the following schema, no markdown blocks, no extra text:
        {
            "name": "A catchy, clear title for the item (max 50 chars)",
            "description": "A detailed, helpful description including estimated condition",
            "category": "One of: Electronics, Furniture, Clothing, Books, Home, Toys, Sports, Other",
            "ecoSeeds": "A suggested integer value between 1 and 50 representing the eco-impact/value of reusing this item (10 is average)"
        }`;

        const imagePart = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: "image/jpeg" // Assuming jpeg, Gemini can handle generic image mimetypes
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // Clean up markdown code blocks if the model still returns them
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(cleanedText);
    } catch (error) {
        logger.error({ err: error }, 'Gemini image analysis failed');
        throw error;
    }
};

/**
 * Uses Groq to extract core search intent keywords from natural language.
 * Uses Upstash Redis for caching to prevent duplicate Groq API calls.
 */
export const extractSearchIntent = async (query) => {
    try {
        if (!process.env.GROQ_API_KEY) return [query]; // Fallback to raw query

        const cacheKey = `search_intent:${query.toLowerCase().trim()}`;
        
        // Check cache first
        if (redis) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                logger.debug('Cache hit for search intent: %s', query);
                return cached;
            }
        }

        logger.debug('Extracting search intent with Groq: %s', query);
        
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a search intent extractor. Extract 1 to 3 core keywords or categories from the user's query. Return ONLY a comma-separated list of lowercase keywords. Nothing else."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            model: "llama-3.1-8b-instant", // Fast model
            temperature: 0.1,
            max_tokens: 20,
        });

        const resultText = completion.choices[0]?.message?.content || "";
        const keywords = resultText.split(',').map(k => k.trim()).filter(k => k);
        const finalKeywords = keywords.length > 0 ? keywords : [query];

        // Cache for 24 hours
        if (redis) {
            await redis.set(cacheKey, finalKeywords, { ex: 86400 });
        }

        return finalKeywords;
    } catch (error) {
        logger.error({ err: error }, 'Groq intent extraction failed');
        // Fallback to raw query
        return [query];
    }
};

/**
 * Rate Limiter helper using Upstash Redis
 */
export const checkRateLimit = async (identifier, limit, windowSeconds) => {
    if (!redis) return { success: true };
    
    const key = `ratelimit:${identifier}`;
    try {
        const requests = await redis.incr(key);
        if (requests === 1) {
            await redis.expire(key, windowSeconds);
        }
        
        if (requests > limit) {
            return { success: false, limit, remaining: 0 };
        }
        return { success: true, limit, remaining: limit - requests };
    } catch (error) {
        logger.error({ err: error }, 'Rate limit check failed');
        return { success: true }; // Fail open
    }
};

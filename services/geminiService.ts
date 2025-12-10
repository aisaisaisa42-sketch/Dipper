import { GoogleGenAI } from "@google/genai";
import { AppSchema } from "../types";

// Initialize Gemini with the provided API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Full Stack Web Developer and UI/UX Designer. 
Your task is to generate fully functional, runnable single-page web applications based on user prompts.

CRITICAL RULES:
1. **Output Format**: You MUST return a SINGLE valid JSON object. Do not add any text outside the JSON.
   - Schema: { "appName": "String", "description": "String", "code": "String (Full HTML)" }
2. **Tech Stack**:
   - Structure: HTML5 (Single file).
   - Styling: Tailwind CSS (via CDN). <script src="https://cdn.tailwindcss.com"></script>
   - Icons: Lucide Icons (via CDN). <script src="https://unpkg.com/lucide@latest"></script> (Call \`lucide.createIcons()\` at end of body).
   - Logic: Vanilla JavaScript inside <script> tags.
3. **Functionality**:
   - The app must be **fully functional**. Buttons must work, forms must validate/submit (mock logic), interactivity must happen.
   - **NO PLACEHOLDERS** in logic. Write the actual JS.
4. **IMAGES (MANDATORY)**:
   - When the app needs a visual (products, hero, avatars), **YOU MUST GENERATE IT**.
   - Use this EXACT format for image tags:
     \`<img src="https://placehold.co/600x400?text=Generating..." data-image-prompt="[Detailed description of the image]" class="..." alt="...">\`
   - **data-image-prompt** is REQUIRED. Describe the image in detail.
5. **Design**:
   - Modern, clean, "SaaS" aesthetic. Use gradients, shadows, rounded corners.

Example JSON:
{
  "appName": "Coffee Shop",
  "description": "A coffee shop landing page",
  "code": "<!DOCTYPE html><html>...</html>"
}
`;

// Helper: robustly clean and parse JSON from LLM output
export function cleanAndParseJSON(text: string): AppSchema {
  // 1. Remove markdown code blocks (```json ... ```)
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  
  // 2. Find the first '{' and last '}' to strip extraneous text
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }

  // 3. Attempt parse
  try {
    return JSON.parse(clean);
  } catch (e) {
    // 4. Fallback: simple escape fix if newlines in strings caused issues (basic heuristic)
    try {
        // sometimes undefined newlines break json
        const fixed = clean.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"); 
        return JSON.parse(fixed);
    } catch (e2) {
        throw new Error("Failed to parse AI response as JSON.");
    }
  }
}

// Generator function for streaming
export async function* streamAppConfig(prompt: string) {
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// Function to generate image from prompt with internal retry
export async function generateImage(prompt: string, attempt = 1): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: prompt + ", photorealistic, 4k, high quality, professional photography" }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Image Generation Error (Attempt ${attempt}):`, error);
    if (attempt < 3) {
        // Simple exponential backoff: 500ms, 1000ms
        await new Promise(r => setTimeout(r, attempt * 500));
        return generateImage(prompt, attempt + 1);
    }
    return null; 
  }
}

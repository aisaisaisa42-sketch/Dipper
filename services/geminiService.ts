import { GoogleGenAI } from "@google/genai";
import { AppSchema } from "../types";

// Initialize Gemini with the provided API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Full Stack Web Developer and UI/UX Designer. 
Your task is to generate fully functional, runnable single-page web applications based on user prompts.

RULES:
1. **Output Format**: Return a single valid JSON object containing the app details and the full source code.
   - Schema: { "appName": "String", "description": "String", "code": "String (Full HTML)" }
2. **Tech Stack**:
   - Use **HTML5** for structure.
   - Use **Tailwind CSS** (via CDN) for styling. ALWAYS include the script: <script src="https://cdn.tailwindcss.com"></script>
   - Use **Vanilla JavaScript** for logic within <script> tags.
   - Use **Lucide Icons** (via CDN). <script src="https://unpkg.com/lucide@latest"></script> and call \`lucide.createIcons()\` at the end of the body.
3. **Functionality**:
   - The app must be **fully functional**. Buttons must work, forms must validate/submit (mock logic), interactivity must happen.
   - **NO PLACEHOLDERS** in logic. Write the actual JS.
   - **NO MOCKUPS**. The code must run immediately in an iframe.
4. **IMAGES (CRITICAL)**:
   - When the app needs a product image, hero image, or any visual, **YOU MUST GENERATE IT**.
   - Use this EXACT format for image tags:
     \`<img src="https://placehold.co/600x400?text=Generating..." data-image-prompt="[Detailed description of the image]" class="w-full h-auto object-contain rounded-lg shadow-md" alt="Image">\`
   - **data-image-prompt** is REQUIRED. Describe the image in detail (e.g., "A modern sleek coffee maker, white background, studio lighting" or "Lifestyle shot of a happy person using the app").
   - Ensure images are responsive (\`w-full h-auto\`).
5. **Design**:
   - Make it look beautiful, modern, and professional (Stripe/Vercel aesthetic).
   - Use nice gradients, shadows, and rounded corners.

Example JSON Output:
{
  "appName": "Coffee Shop",
  "description": "A coffee shop landing page",
  "code": "<!DOCTYPE html>...<img src='https://placehold.co/600x400' data-image-prompt='Steaming cappuccino cup on wooden table, overhead view, high quality' class='w-full h-auto object-cover'>..."
}
`;

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

// Function to generate image from prompt
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    // We use gemini-2.5-flash-image for generation as per guidelines for general image tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: prompt + ", photorealistic, 4k, high quality, professional photography" }
        ],
      },
      config: {
        // Checking guidelines: responseMimeType is NOT supported for nano banana series
        // aspect ratio can be set. Let's default to square or 4:3.
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
    console.error("Image Generation Error:", error);
    return null; 
  }
}
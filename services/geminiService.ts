import { GoogleGenAI } from "@google/genai";
import { AppSchema } from "../types";

// Initialize Gemini with the provided API key
const ai = new GoogleGenAI({ apiKey: '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' });

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
   - If complex UI state is strictly required, you MAY use React/ReactDOM via CDN with Babel Standalone, but Vanilla JS is preferred for performance and simplicity in this specific environment.
   - Use **Lucide Icons** (via CDN or SVG). <script src="https://unpkg.com/lucide@latest"></script> and call \`lucide.createIcons()\` at the end of the body.
3. **Functionality**:
   - The app must be **fully functional**. Buttons must work, forms must validate/submit (mock logic), interactivity must happen.
   - **NO PLACEHOLDERS**. Do not say "Logic goes here". Write the logic.
   - **NO MOCKUPS**. The code must run immediately in an iframe.
4. **Design**:
   - Make it look beautiful, modern, and professional (Stripe/Vercel aesthetic).
   - Use nice gradients, shadows, and rounded corners.
   - Ensure responsive design.

Example JSON Output:
{
  "appName": "ToDo App",
  "description": "A working todo list with local storage",
  "code": "<!DOCTYPE html><html><head><script src='https://cdn.tailwindcss.com'></script></head><body class='bg-slate-50'>...</body></html>"
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
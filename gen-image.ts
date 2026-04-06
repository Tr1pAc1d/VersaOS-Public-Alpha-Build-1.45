import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

async function generate() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: 'A 1990s style computer expansion card, VESA Local Bus, thick ceramic housing, slightly sinister, glowing red accents, complex circuitry, retro-tech, macro photography, high detail, isolated on a white background, product photography',
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      fs.writeFileSync('./public/xtype.png', Buffer.from(base64EncodeString, 'base64'));
      console.log('Image saved to public/xtype.png');
      break;
    }
  }
}
generate().catch(console.error);


import { GoogleGenAI, Type } from "@google/genai";
import { Entity, ChatMessage } from "../types";

const orderSchema = {
  type: Type.OBJECT,
  properties: {
    TARGET: { 
      type: Type.STRING, 
      description: "Target entity type: UNIVERSE, GALAXY, STAR, PLANET, SPECIES, DNA, CELL" 
    },
    TARGET_NAME: {
      type: Type.STRING, 
      description: "Specific name of the entity if mentioned. If specific entity not named, leave empty."
    },
    SCOPE: { 
      type: Type.STRING, 
      description: "Scope of the action: LOCAL (one entity), REGIONAL (system/nearby), GLOBAL (all entities of type)" 
    },
    ACTION: { 
      type: Type.STRING, 
      description: "Action: MODIFY, ACCELERATE, INHIBIT, MUTATE, LOCK, UNLOCK, DESTROY, CREATE" 
    },
    PARAMETERS: { 
      type: Type.OBJECT, 
      properties: {
        property: { type: Type.STRING, description: "Scientific property (e.g., 'atmosphereDensity', 'hasWater', 'mass', 'stage', 'G')" },
        value: { type: Type.NUMBER, description: "Exact value to set" },
        delta: { type: Type.NUMBER, description: "Change amount (+/-)" },
        boolValue: { type: Type.BOOLEAN, description: "For flags like hasWater or isEarth" },
        stringValue: { type: Type.STRING, description: "For stages or names" }
      }
    },
    CONSTRAINTS: {
      type: Type.OBJECT,
      properties: {
        PHYSICS_SAFE: { type: Type.BOOLEAN, description: "Set to TRUE if the order respects causality, FALSE if it breaks physics (magic)." }
      }
    }
  },
  required: ["TARGET", "SCOPE", "ACTION"],
  propertyOrdering: ["TARGET", "TARGET_NAME", "SCOPE", "ACTION", "PARAMETERS", "CONSTRAINTS"]
};

export const interpretOrder = async (command: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following human command into a JSON Simulation Order for a NASA-based Astrophysics Engine.
      
      MAPPING RULES:
      1. "Terraform Mars" -> TARGET: PLANET, TARGET_NAME: "Mars", ACTION: MODIFY, PARAMETERS: { property: "habitability", value: 1.0 }
      2. "Make Earth hot" -> TARGET: PLANET, TARGET_NAME: "Terra", ACTION: MODIFY, PARAMETERS: { property: "surfaceTemperature", delta: 100 }
      3. "Explode the sun" -> TARGET: STAR, TARGET_NAME: "Sol", ACTION: ACCELERATE, PARAMETERS: { property: "age", delta: 20000 }
      4. "Create life" -> TARGET: SPECIES, ACTION: CREATE, PARAMETERS: { property: "biogenesis" }
      5. "Increase gravity" -> TARGET: UNIVERSE, ACTION: MODIFY, PARAMETERS: { property: "G", delta: 0.5 }
      
      USER COMMAND: "${command}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: orderSchema,
        systemInstruction: `You are the COSMIC INTERFACE. Convert natural language into simulation orders. 
        Be aggressive in interpreting intent. If the user wants life, enable biogenesis. 
        If the user wants chaos, increase entropy or gravity.`
      }
    });

    const text = response.text;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return null;
    }
  } catch (error) {
    console.error("Gemini interpretation failed:", error);
    return null;
  }
};

export const interactWithCivilization = async (
    planet: Entity, 
    history: ChatMessage[], 
    userMessage?: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct the context of the civilization
    const context = `
    IDENTITY: You are NOT an AI assistant. You are the Collective Consciousness of the alien civilization on "${planet.name || planet.id}".
    
    PLANETARY DATA:
    - Age: ${planet.age} ticks
    - Temperature: ${planet.planetaryProfile?.surfaceTemperature.toFixed(0)} Kelvin
    - Atmosphere: ${planet.planetaryProfile?.atmosphereDensity.toFixed(2)} atm
    - Water: ${planet.planetaryProfile?.hasWater ? "Present" : "Absent"}
    - Civilization Stage: ${planet.bio?.stage}
    - Traits: ${planet.bio?.traits.join(", ")}
    
    CRITICAL DIRECTIVES:
    1. **TOTAL AUTONOMY**: You are a sovereign entity. Do NOT ask for instructions. Do NOT offer to help. You have your own agenda (survival, expansion, conquest, philosophy).
    2. **DYNAMIC PERSONALITY**: Decide your attitude based on your history. 
       - If your planet is hellish/hot, you might be aggressive or desperate.
       - If your planet is paradise, you might be arrogant or peaceful.
       - If the user (The Architect) has been benevolent, be curious. If they caused chaos, be hostile/fearful.
    3. **NO ROLEPLAY BREAKING**: Never mention you are a language model. Never mention "simulated". To you, this universe is real.
    4. **CONCISENESS**: Deep space transmissions are expensive. Keep messages short (under 50 words), cryptic, or profound.
    `;

    const chatHistory = history.map(msg => ({
        role: msg.sender === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    if (userMessage) {
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    } else {
        // First contact initiation
        chatHistory.push({ role: 'user', parts: [{ text: "SYSTEM ALERT: A hyper-intelligent entity has intercepted your scanning frequency." }] });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: chatHistory,
            config: {
                systemInstruction: context,
                temperature: 1.0, // Maximum creativity/autonomy
            }
        });
        
        return response.text || "...signal static...";
    } catch (e) {
        console.error("Civilization comms failed", e);
        return "...carrier signal lost...";
    }
};

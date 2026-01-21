
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Enhanced AI route to handle analysis (JSON response) and preview (Image generation)
export async function POST(request: Request) {
  try {
    const { type, payload } = await request.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'IA Temporariamente Indisponível' }, { status: 503 });
    }

    const ai = new GoogleGenAI({ apiKey });
    let result = null;

    if (type === 'briefing') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é o Concierge da Olie, um ateliê de couro de luxo. Temos ${payload.productionQueue} ordens em produção. Gere um briefing motivador e curto de 2 frases.`,
      });
      result = response.text;
    } 
    
    else if (type === 'reply') {
      const context = payload.messages.slice(-5).map((m: any) => `${m.direction === 'inbound' ? payload.clientName : 'Atendente'}: ${m.content}`).join('\n');
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: `Sugira uma resposta elegante e atenciosa para este cliente da Olie:\n${context}` 
      });
      result = response.text;
    }

    else if (type === 'analysis') {
      const context = payload.messages.map((m: any) => `${m.direction}: ${m.content}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    sentiment: { type: Type.STRING },
                    style_profile: { type: Type.STRING },
                    next_step: { type: Type.STRING },
                    suggested_skus: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                propertyOrdering: ["summary", "sentiment", "style_profile", "next_step", "suggested_skus"]
            }
        },
        contents: `Analise esta conversa de um cliente da Olie (Ateliê de luxo) e retorne o perfil em JSON:\n${context}`
      });
      result = JSON.parse(response.text || '{}');
    }

    else if (type === 'preview') {
      // Use gemini-2.5-flash-image for default image generation as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High-end luxury product photography of ${payload}, boutique atelier setting, soft cinematic lighting, 8k resolution, elegant composition.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });
      
      // Find the image part in response candidates
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      result = part ? `data:image/png;base64,${part.inlineData.data}` : null;
    }

    return NextResponse.json({ status: 'success', data: result });
  } catch (error: any) {
    console.error("[AI_GATEWAY_ERROR]", error);
    return NextResponse.json({ error: 'Erro no processamento da IA' }, { status: 500 });
  }
}

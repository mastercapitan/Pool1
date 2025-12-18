
import { GoogleGenAI } from "@google/genai";
import { POOL_VOLUME_M3, LOCATION } from "./constants";

export const getMaintenanceAdvice = async (status: any, inventory: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Actúa como un experto en mantenimiento de piscinas en climas desérticos costeros.
      Ubicación: ${LOCATION}.
      Volumen Piscina: ${POOL_VOLUME_M3} m3.
      Estado Actual: pH ${status.ph}, Cloro ${status.chlorine}, Estado del agua: ${status.waterState}.
      Inventario disponible: ${JSON.stringify(inventory)}.
      
      Proporciona un plan de acción paso a paso para corregir el agua verde y el pH. 
      Calcula las cantidades exactas para ${POOL_VOLUME_M3} m3.
      Incluye consejos sobre la evaporación extrema en Tocopilla y el impacto de la camanchaca (niebla costera).
      Formato: Markdown.
    `,
  });

  const response = await model;
  return response.text;
};


import { GoogleGenAI, Type } from "@google/genai";
import { ReviewFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReview = async (review: ReviewFormData) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this guestbook review for "Shri Krishna Mahal" (an elegant wedding/event hall).
        Reviewer: ${review.name}
        Date: ${review.date}
        Rating: ${review.rating}/5
        Message: ${review.message}

        Tasks:
        1. Determine if the sentiment is Positive, Neutral, or Negative.
        2. Write a warm, professional, and personalized response from the Mahal Management (signed "The Management, Shri Krishna Mahal"). The response should be empathetic to their experience.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              description: "The overall sentiment of the review (Positive, Neutral, Negative).",
            },
            managementResponse: {
              type: Type.STRING,
              description: "A personalized thank you or address from the management.",
            },
          },
          required: ["sentiment", "managementResponse"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      sentiment: review.rating >= 4 ? "Positive" : review.rating <= 2 ? "Negative" : "Neutral",
      managementResponse: "Thank you so much for your feedback! We are honored to have been part of your special occasion. - The Management, Shri Krishna Mahal"
    };
  }
};

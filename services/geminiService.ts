import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InterviewAnalysis } from "../types";

// Schema definition for the structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 based on overall performance.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief executive summary of the candidate's performance.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 key strengths observed.",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 key areas for improvement.",
    },
    actionableTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific, actionable advice for the next interview.",
    },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Category name (e.g., Verbal Communication, Body Language, Content Relevance, Visual Aids/Screen Share)" },
          score: { type: Type.INTEGER, description: "Score 0-100 for this category" },
          feedback: { type: Type.STRING, description: "Specific feedback for this category" },
          status: { type: Type.STRING, enum: ["excellent", "good", "needs_improvement"] }
        },
        required: ["name", "score", "feedback", "status"]
      }
    }
  },
  required: ["overallScore", "summary", "strengths", "weaknesses", "actionableTips", "categories"],
};

export const analyzeInterview = async (
  videoFile: File,
  jobDescription: string
): Promise<InterviewAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await fileToGenerativePart(videoFile);

  const prompt = `
    You are an expert Interview Coach and Technical Recruiter.
    Review the uploaded video which contains an interview practice session.
    The video may include audio, webcam footage, and screen sharing.
    
    The user is applying for a role described as:
    "${jobDescription || 'General Software Engineering Role'}"

    Please analyze the video for:
    1. Verbal Communication: Clarity, pace, tone, filler words.
    2. Non-Verbal Communication: Eye contact, body language, confidence (if camera is on).
    3. Content Quality: Relevance to the job description, technical depth, structure of answers.
    4. Screen Share / Visuals: If they are sharing their screen, assess the clarity of their walkthrough and code/presentation.

    Provide a structured JSON response evaluating these areas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: base64Data },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more objective analysis
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as InterviewAnalysis;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the video. The file might be too large or the format unsupported.");
  }
};

// Helper to convert File to Base64 part for Gemini
async function fileToGenerativePart(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

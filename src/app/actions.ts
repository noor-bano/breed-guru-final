"use server";

import { generateBreedDescription } from "@/ai/flows/breed-description-generation";
import { translateBreedDescription } from "@/ai/flows/translate-breed-description";
import { classifyBreed } from "@/ai/flows/classify-breed-flow";
import { z } from "zod";

async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}

// Enhanced classifyImageAction with retry logic
export async function classifyImageAction(formData: FormData) {
  const image = formData.get("image") as File;

  if (!image) {
    throw new Error("No image provided.");
  }

  try {
    const imageUri = await fileToDataURI(image);

    let result;
    try {
      // first attempt
      result = await classifyBreed({ photoDataUri: imageUri });
    } catch (error: any) {
      console.error("Error classifying image (first attempt):", error);

      if (error.message?.includes("503")) {
        console.warn("Gemini overloaded, retrying in 5 seconds...");
        await new Promise((res) => setTimeout(res, 5000));

        // retry once
        result = await classifyBreed({ photoDataUri: imageUri });
      } else {
        throw error;
      }
    }

    return {
      predictions: result.predictions,
    };
  } catch (error) {
    console.error("Error classifying image after retries:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to classify image: ${error.message}`);
    }
    throw new Error("Failed to classify image.");
  }
}

const BreedDescriptionInput = z.object({
  breedName: z.string(),
});

export async function getBreedDescriptionAction(breedName: string) {
  try {
    const validatedInput = BreedDescriptionInput.parse({ breedName });
    const result = await generateBreedDescription({
      breedName: validatedInput.breedName,
    });
    return result;
  } catch (error) {
    console.error("Error generating breed description:", error);
    throw new Error("Failed to generate breed description.");
  }
}

const TranslateDescriptionInput = z.object({
  text: z.string(),
  targetLanguage: z.enum(["en", "hi"]),
});

export async function translateDescriptionAction(
  text: string,
  targetLanguage: "en" | "hi"
) {
  try {
    const validatedInput = TranslateDescriptionInput.parse({
      text,
      targetLanguage,
    });
    const result = await translateBreedDescription(validatedInput);
    return result;
  } catch (error) {
    console.error("Error translating description:", error);
    throw new Error("Failed to translate description.");
  }
}

const CorrectionInput = z.object({
  originalPrediction: z.string(),
  correctedBreed: z.string(),
});

export async function saveCorrectionAction(
  originalPrediction: string,
  correctedBreed: string
) {
  try {
    const validatedInput = CorrectionInput.parse({
      originalPrediction,
      correctedBreed,
    });

    // In a real application, you would save this data to a database for model retraining.
    console.log("Saving correction:", {
      original: validatedInput.originalPrediction,
      corrected: validatedInput.correctedBreed,
      timestamp: new Date().toISOString(),
    });

    // Simulate saving time
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    console.error("Error saving correction:", error);
    throw new Error("Failed to save correction.");
  }
}

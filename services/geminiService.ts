
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Data structures
export interface CarouselSlide {
  slideTitle: string;
  caption: string;
  imagePrompt: string;
}

export interface CarouselPlan {
  title: string;
  slides: CarouselSlide[];
  postCaption: string;
}

export interface GeneratedSlide {
  slideTitle: string;
  caption: string;
  imageBase64: string;
}

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please add it to your .env file.");
  }
  return new GoogleGenAI({ apiKey });
}

// Function to generate the carousel plan (text content)
export async function generateCarouselPlan(topic: string, tone: string): Promise<CarouselPlan> {
  const ai = getAiClient();
  const model = 'gemini-2.0-flash';

  const prompt = `
    You are a world-class thought leader and creative director, known for making complex topics accessible and engaging on LinkedIn. Your style is insightful, slightly provocative, and genuinely human.

    Your task is to create a 5-slide LinkedIn carousel plan about a key trend in "${topic}".
    The desired tone is: "${tone}".

    Your entire output must be a single, valid JSON object, with no markdown or comments.

    The JSON object must follow this structure:
    1.  "title": An irresistible, thought-provoking title for the carousel. It should make people stop scrolling.
    2.  "slides": An array of exactly 5 slide objects. Each slide should build on the last, telling a cohesive story. Each object must have:
        a. "slideTitle": A punchy, concise title for the slide. Think of it as a chapter heading.
        b. "caption": A clear, insightful caption (max 250 characters). Explain the concept simply, like you're talking to a smart colleague. Avoid overly corporate jargon.
        c. "imagePrompt": A detailed, artistic prompt for an AI image generator. This should describe a visual theme or metaphor. The aesthetic is 'futuristic minimalism meets organic design'. Think clean lines, abstract shapes, subtle gradients, and a sense of calm intelligence.
    3.  "postCaption": A LinkedIn post caption that feels like it was written by a real, passionate expert, not a content bot.
        - **Hook:** Start with a relatable story, a surprising statistic, or a challenging question that immediately grabs attention.
        - **Context:** Briefly explain why this topic matters right now. Share a personal "aha!" moment or perspective.
        - **Body:** Summarize the key points from the carousel, perhaps as a bulleted list for easy reading.
        - **Engagement:** End with a genuine, open-ended question that invites real discussion and debate.
        - **Personality:** Use emojis sparingly but effectively to convey tone.
        - **Hashtags:** Include 4-5 highly relevant and trending hashtags.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Main title of the carousel." },
            slides: {
              type: Type.ARRAY,
              description: "An array of 5 slide objects.",
              items: {
                type: Type.OBJECT,
                properties: {
                  slideTitle: { type: Type.STRING, description: "Title for the individual slide." },
                  caption: { type: Type.STRING, description: "Caption for the slide (under 250 characters)." },
                  imagePrompt: { type: Type.STRING, description: "A detailed prompt for an AI image generator." },
                },
                required: ["slideTitle", "caption", "imagePrompt"],
              },
            },
            postCaption: { type: Type.STRING, description: "A caption for the LinkedIn post, with hashtags and emojis." },
          },
          required: ["title", "slides", "postCaption"],
        },
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as CarouselPlan;

    if (!plan.slides || plan.slides.length === 0) {
      throw new Error("AI failed to generate slides. Please try a different topic.");
    }

    plan.slides = plan.slides.slice(0, 5);

    return plan;
  } catch (error) {
    console.error("Error generating carousel plan:", error);
    throw new Error("Failed to generate carousel content. The AI may be busy, or the topic could be too sensitive. Please try again.");
  }
}

// Function to generate a single, complete slide image with integrated text
export async function generateCarouselImage(
  type: 'cover' | 'content' | 'final',
  data: {
    title?: string;
    caption?: string;
    theme?: string;
    author?: string;
    slideNumber?: string;
    callToAction?: string;
  }
): Promise<string> {
  const ai = getAiClient();
  const model = 'gemini-2.0-flash';

  let prompt = '';

  const baseStyle = `
    Create a visually stunning, professional slide for a LinkedIn carousel.
    The aesthetic is 'futuristic minimalism meets organic design'. It should be clean, sophisticated, and eye-catching.
    The final output must be a single, cohesive image with all text perfectly and legibly integrated into the design.
    Do not include any quotation marks in the text on the image.
    The image aspect ratio is 1:1.
    The visual theme for the background and graphical elements is: '${data.theme}'.
  `;

  switch (type) {
    case 'cover':
      prompt = `
        ${baseStyle}
        This is the COVER slide.
        It must feature the main title prominently: "${data.title}".
        It should also include a smaller, elegant byline for the author: "${data.author}".
        The design should be bold and establish the visual identity for the entire carousel.
      `;
      break;
    case 'content':
      prompt = `
        ${baseStyle}
        This is a CONTENT slide.
        The slide title, which must be the most prominent text, is: "${data.title}".
        The slide caption, which should be smaller and placed below the title, is: "${data.caption}".
        Include a subtle slide number indicator: "${data.slideNumber}".
        The design should visually represent the content's theme while maintaining consistency with the overall aesthetic.
      `;
      break;
    case 'final':
      prompt = `
        ${baseStyle}
        This is the final call-to-action slide.
        It must contain two lines of text:
        Line 1 (prominent): "Follow ${data.author}"
        Line 2 (smaller): "${data.callToAction}"
        The design should be conclusive and visually powerful, matching the established theme. Do not add any other text.
      `;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data found in the AI response.");

  } catch (error) {
    console.error(`Error generating image for type ${type}:`, error);
    throw new Error(`Failed to generate the ${type} slide. Please try again.`);
  }
}
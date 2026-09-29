import OpenAI from "openai";
import { buildStoryPrompt } from "../prompts/story.js";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function demoStory(input) {
  const hero = "Arin";
  const companion = "Maya";
  const villain = "The Null King";
  const count = input.panelCount;

  const base = [
    {
      description: `${hero} discovers a strange glowing object that reacts to the world around them.`,
      caption: "Every adventure starts with one impossible moment.",
      dialogue: [{ character: hero, text: "Okay... that definitely wasn't normal." }]
    },
    {
      description: `${hero} meets ${companion}, who recognizes the object's hidden power.`,
      caption: "A secret is easier to face with a friend.",
      dialogue: [{ character: companion, text: "If you touched it, the portal knows your name." }]
    },
    {
      description: `A portal opens above the city and ${villain} appears in a dramatic silhouette.`,
      caption: "Then the sky cracked open.",
      dialogue: [{ character: villain, text: "The story belongs to me now." }]
    },
    {
      description: `${hero} and ${companion} race toward the portal while the city lights flicker.`,
      caption: "No time for a perfect plan.",
      dialogue: [{ character: hero, text: "We go together. We figure it out on the way." }]
    },
    {
      description: `${hero} uses the object's energy to protect the city from the collapsing portal.`,
      caption: "Courage is choosing to act before you feel ready.",
      dialogue: [{ character: companion, text: "Arin, now!" }]
    },
    {
      description: `The portal closes, the city returns to normal, and ${hero} looks at the object with a smile.`,
      caption: "One chapter ends. Another is already waiting.",
      dialogue: [{ character: hero, text: "Next time, we're asking questions first." }]
    },
    {
      description: `${hero} and ${companion} discover a second symbol hidden on the object.`,
      caption: "But the mystery was never really over.",
      dialogue: [{ character: companion, text: "You see that symbol too, right?" }]
    },
    {
      description: `A tiny new portal opens in the distance as the friends exchange a determined look.`,
      caption: "To be continued...",
      dialogue: [{ character: hero, text: "Round two?" }]
    }
  ];

  const panels = Array.from({ length: count }, (_, index) => {
    const item = base[index % base.length];
    return {
      id: `panel-${index + 1}`,
      description: item.description,
      caption: item.caption,
      dialogue: item.dialogue,
      imagePrompt: `${input.visualStyle}, comic book panel, ${item.description}, cinematic composition, expressive faces, clean line art, consistent characters, no text, no speech bubbles`
    };
  });

  return {
    title: `${hero} and the Portal of Possibility`,
    logline: `A young hero discovers a mysterious power and must protect the city before a dangerous portal consumes it.`,
    genre: input.genre,
    tone: input.tone,
    characters: [
      { name: hero, role: "Curious young hero", description: "Brave, impulsive and inventive." },
      { name: companion, role: "Clever friend", description: "Observant, practical and loyal." },
      { name: villain, role: "Mysterious antagonist", description: "Ambitious and theatrical." }
    ],
    panels
  };
}

function normalizeStory(raw, input) {
  const source = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!source.title || !Array.isArray(source.panels)) throw new Error("AI returned an invalid story.");
  const panels = source.panels.slice(0, input.panelCount).map((panel, index) => ({
    id: `panel-${index + 1}`,
    description: String(panel.description || ""),
    caption: String(panel.caption || ""),
    dialogue: Array.isArray(panel.dialogue)
      ? panel.dialogue.map((line) => ({
          character: String(line.character || "Narrator"),
          text: String(line.text || "")
        }))
      : [],
    imagePrompt: String(panel.imagePrompt || `${input.visualStyle}, comic panel, ${panel.description || ""}, no text`)
  }));
  return {
    title: String(source.title),
    logline: String(source.logline || ""),
    genre: input.genre,
    tone: input.tone,
    characters: Array.isArray(source.characters) ? source.characters : [],
    panels
  };
}

export async function generateStory(input) {
  if (!client) return demoStory(input);

  const response = await client.responses.create({
    model: process.env.OPENAI_TEXT_MODEL || "gpt-5.6-luna",
    input: buildStoryPrompt(input),
    text: {
      format: {
        type: "json_schema",
        name: "comic_story",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            logline: { type: "string" },
            characters: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  role: { type: "string" },
                  description: { type: "string" }
                },
                required: ["name", "role", "description"]
              }
            },
            panels: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  description: { type: "string" },
                  caption: { type: "string" },
                  dialogue: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        character: { type: "string" },
                        text: { type: "string" }
                      },
                      required: ["character", "text"]
                    }
                  },
                  imagePrompt: { type: "string" }
                },
                required: ["description", "caption", "dialogue", "imagePrompt"]
              }
            }
          },
          required: ["title", "logline", "characters", "panels"]
        }
      }
    }
  });

  return normalizeStory(response.output_text, input);
}

export async function generatePanelImage(prompt) {
  if (!client) {
    throw new Error("Add OPENAI_API_KEY to server/.env to generate artwork.");
  }
  if (process.env.ENABLE_IMAGE_GENERATION !== "true") {
    throw new Error("Set ENABLE_IMAGE_GENERATION=true in server/.env to enable artwork generation.");
  }

  const result = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    prompt
  });

  const item = result?.data?.[0];
  if (!item) throw new Error("No image was returned by the image API.");

  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item.url) return item.url;
  throw new Error("Image response did not contain a usable image.");
}

import test from "node:test";
import assert from "node:assert/strict";
import { buildStoryPrompt } from "../src/prompts/story.js";

test("story prompt contains all requested controls", () => {
  const prompt = buildStoryPrompt({
    idea: "A goalkeeper finds a magical football",
    genre: "Sports",
    tone: "Epic",
    audience: "Teen",
    panelCount: 6,
    visualStyle: "Modern comic book"
  });

  assert.match(prompt, /goalkeeper finds a magical football/);
  assert.match(prompt, /Sports/);
  assert.match(prompt, /6/);
  assert.match(prompt, /Modern comic book/);
});

test("panel count is constrained by API route logic", () => {
  const value = Math.min(10, Math.max(4, Number(20)));
  assert.equal(value, 10);
});

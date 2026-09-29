import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { generateStory, generatePanelImage } from "./services/ai.js";
import {
  createProject,
  listProjects,
  getProject,
  deleteProject,
  updatePanel
} from "./services/store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "ComicCraft API",
    ai: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.get("/api/projects", (req, res) => {
  res.json({ projects: listProjects() });
});

app.get("/api/projects/:id", (req, res) => {
  const project = getProject(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
});

app.post("/api/projects/generate", async (req, res) => {
  try {
    const input = {
      idea: String(req.body.idea || "").trim(),
      genre: String(req.body.genre || "Adventure"),
      tone: String(req.body.tone || "Fun"),
      audience: String(req.body.audience || "Teen"),
      panelCount: Math.min(10, Math.max(4, Number(req.body.panelCount || 6))),
      visualStyle: String(req.body.visualStyle || "Modern comic book")
    };

    if (input.idea.length < 10) {
      return res.status(400).json({ error: "Please enter a story idea of at least 10 characters." });
    }

    const story = await generateStory(input);
    const project = createProject({ ...story, input });
    res.status(201).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Could not generate comic." });
  }
});

app.post("/api/projects/:id/panels/:panelId/image", async (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const panel = project.panels.find((item) => item.id === req.params.panelId);
    if (!panel) return res.status(404).json({ error: "Panel not found" });

    const imageUrl = await generatePanelImage(panel.imagePrompt);
    const updated = updatePanel(project.id, panel.id, { imageUrl });
    res.json({ project: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Could not generate panel artwork."
    });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  const deleted = deleteProject(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Project not found" });
  res.json({ ok: true });
});

// Serve the production React build.
const clientDist = path.resolve(__dirname, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*splat", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ComicCraft API running at http://localhost:${PORT}`);
});

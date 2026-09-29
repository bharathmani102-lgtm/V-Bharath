import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");
const dataFile = path.join(dataDir, "projects.json");

function ensureStore() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf8");
}

function readAll() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeAll(projects) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(projects, null, 2), "utf8");
}

export function listProjects() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getProject(id) {
  return readAll().find((project) => project.id === id) || null;
}

export function createProject(project) {
  const projects = readAll();
  const saved = {
    ...project,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  projects.unshift(saved);
  writeAll(projects);
  return saved;
}

export function updatePanel(projectId, panelId, patch) {
  const projects = readAll();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return null;
  const panel = project.panels.find((item) => item.id === panelId);
  if (!panel) return null;
  Object.assign(panel, patch);
  project.updatedAt = new Date().toISOString();
  writeAll(projects);
  return project;
}

export function deleteProject(id) {
  const projects = readAll();
  const next = projects.filter((project) => project.id !== id);
  if (next.length === projects.length) return false;
  writeAll(next);
  return true;
}

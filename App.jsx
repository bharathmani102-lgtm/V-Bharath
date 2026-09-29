import React, { useEffect, useMemo, useState } from "react";

const initialForm = {
  idea: "",
  genre: "Adventure",
  tone: "Fun",
  audience: "Teen",
  panelCount: 6,
  visualStyle: "Modern comic book"
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [message, setMessage] = useState("");

  const api = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const loadProjects = async () => {
    try {
      const data = await api("/api/projects");
      setProjects(data.projects);
    } catch {
      setMessage("Backend is not running. Start it with npm run dev.");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const generate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await api("/api/projects/generate", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setStory(data.project);
      await loadProjects();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (panelId) => {
    if (!story) return;
    setImageLoading((old) => ({ ...old, [panelId]: true }));
    try {
      const data = await api(`/api/projects/${story.id}/panels/${panelId}/image`, {
        method: "POST"
      });
      setStory(data.project);
      await loadProjects();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setImageLoading((old) => ({ ...old, [panelId]: false }));
    }
  };

  const openProject = async (id) => {
    try {
      const data = await api(`/api/projects/${id}`);
      setStory(data.project);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteProject = async (id) => {
    try {
      await api(`/api/projects/${id}`, { method: "DELETE" });
      if (story?.id === id) setStory(null);
      await loadProjects();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const totalPanels = useMemo(() => story?.panels?.length || 0, [story]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <div>
            <h1>ComicCraft</h1>
            <p>AI Comic Story Creator</p>
          </div>
        </div>
        <div className="status-pill">AI STORY STUDIO</div>
      </header>

      <main className="layout">
        <section className="hero">
          <div>
            <span className="eyebrow">CREATE • VISUALIZE • SAVE</span>
            <h2>Turn one idea into a comic.</h2>
            <p>
              Describe your story, choose a genre and style, and ComicCraft
              builds characters, scenes, dialogue and image prompts.
            </p>
          </div>
          <div className="hero-badge">🗯️</div>
        </section>

        {message && <div className="notice">{message}</div>}

        <section className="workspace">
          <form className="card creator-card" onSubmit={generate}>
            <div className="card-heading">
              <div>
                <span className="eyebrow">01 / STORY IDEA</span>
                <h3>Build your comic</h3>
              </div>
              <span className="spark">✦</span>
            </div>

            <label>
              Story idea
              <textarea
                required
                minLength={10}
                rows={5}
                value={form.idea}
                onChange={(e) => setForm({ ...form, idea: e.target.value })}
                placeholder="Example: A young goalkeeper discovers a magical football that can open portals..."
              />
            </label>

            <div className="field-grid">
              <label>
                Genre
                <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
                  <option>Adventure</option>
                  <option>Fantasy</option>
                  <option>Comedy</option>
                  <option>Science Fiction</option>
                  <option>Mystery</option>
                  <option>Superhero</option>
                  <option>Sports</option>
                </select>
              </label>

              <label>
                Tone
                <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                  <option>Fun</option>
                  <option>Epic</option>
                  <option>Emotional</option>
                  <option>Dark</option>
                  <option>Inspiring</option>
                </select>
              </label>

              <label>
                Audience
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option>Kids</option>
                  <option>Teen</option>
                  <option>Young Adult</option>
                  <option>General</option>
                </select>
              </label>

              <label>
                Panels
                <select value={form.panelCount} onChange={(e) => setForm({ ...form, panelCount: Number(e.target.value) })}>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                </select>
              </label>
            </div>

            <label>
              Visual style
              <select value={form.visualStyle} onChange={(e) => setForm({ ...form, visualStyle: e.target.value })}>
                <option>Modern comic book</option>
                <option>Anime-inspired</option>
                <option>Saturday morning cartoon</option>
                <option>Noir graphic novel</option>
                <option>Watercolor graphic novel</option>
              </select>
            </label>

            <button className="primary-btn" disabled={loading}>
              {loading ? "Creating comic..." : "✨ Generate Comic"}
            </button>
          </form>

          <aside className="card library-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">02 / LIBRARY</span>
                <h3>Saved comics</h3>
              </div>
              <span className="count">{projects.length}</span>
            </div>

            {projects.length === 0 ? (
              <div className="empty">Your generated comics will appear here.</div>
            ) : (
              <div className="project-list">
                {projects.map((project) => (
                  <div className="project-row" key={project.id}>
                    <button onClick={() => openProject(project.id)} className="project-open">
                      <strong>{project.title}</strong>
                      <span>{project.genre} · {project.panels.length} panels</span>
                    </button>
                    <button className="icon-btn danger" onClick={() => deleteProject(project.id)} aria-label="Delete project">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>

        {story && (
          <section className="card comic-card">
            <div className="comic-header">
              <div>
                <span className="eyebrow">03 / COMIC PREVIEW</span>
                <h3>{story.title}</h3>
                <p>{story.logline}</p>
              </div>
              <div className="meta">
                <span>{story.genre}</span>
                <span>{story.tone}</span>
                <span>{totalPanels} panels</span>
              </div>
            </div>

            <div className="characters">
              {story.characters?.map((character) => (
                <div className="character" key={character.name}>
                  <div className="avatar">{character.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{character.name}</strong>
                    <p>{character.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-grid">
              {story.panels.map((panel, index) => (
                <article className="comic-panel" key={panel.id}>
                  <div className="panel-number">PANEL {index + 1}</div>
                  {panel.imageUrl ? (
                    <img src={panel.imageUrl} alt={panel.description} />
                  ) : (
                    <div className="art-placeholder">
                      <span>🎨</span>
                      <strong>Artwork not generated</strong>
                      <small>{panel.imagePrompt}</small>
                    </div>
                  )}
                  <div className="panel-copy">
                    <p className="caption">{panel.caption}</p>
                    <div className="dialogue">
                      {panel.dialogue?.map((line, i) => (
                        <div className="speech" key={i}>
                          <strong>{line.character}</strong>
                          <span>“{line.text}”</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="secondary-btn"
                      disabled={imageLoading[panel.id]}
                      onClick={() => generateImage(panel.id)}
                    >
                      {imageLoading[panel.id] ? "Generating..." : panel.imageUrl ? "Regenerate artwork" : "Generate artwork"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>ComicCraft</span>
        <span>AI Comic Story Creator</span>
      </footer>
    </div>
  );
}

export default App;

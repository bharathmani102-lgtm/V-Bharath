# ComicCraft Architecture

## Flow

Browser → React/Vite → Express API → AI service → JSON storage

### Story generation

1. User submits the story form.
2. `POST /api/projects/generate` validates the input.
3. `services/ai.js` uses OpenAI Responses API when a key is configured.
4. Without a key, the deterministic demo generator returns a working sample story.
5. The project is stored in `server/data/projects.json`.
6. React renders the panels.

### Image generation

1. User presses "Generate artwork" on a panel.
2. Express loads the saved panel's image prompt.
3. OpenAI image generation is called when enabled.
4. The returned image is stored directly as a data URL for this local demo.
5. React refreshes the panel.

## Production upgrade path

- PostgreSQL for project/user data.
- S3-compatible object storage for images.
- Authentication.
- Rate limiting and request logging.
- Background jobs for image generation.
- Content moderation.
- CDN-backed image URLs.

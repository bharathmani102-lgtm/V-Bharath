# ComicCraft — AI Comic Story Creator

ComicCraft is a full-stack web app for turning a short idea into a structured comic story. It can:
- Generate a title, characters, panels, dialogue, captions and visual prompts.
- Render the comic as a panel grid.
- Save projects locally on the server.
- Generate panel artwork with OpenAI when an API key and image generation are enabled.
- Run in demo mode without an API key.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Persistence: JSON file storage (easy to replace with PostgreSQL/MongoDB)
- AI: OpenAI Responses API for story generation and OpenAI image generation for artwork

## Requirements

- Node.js 18+ (20+ recommended)
- npm
- Optional OpenAI API key for live AI generation

## VS Code setup

1. Extract/open the `ComicCraft` folder in VS Code.
2. Open the integrated terminal.
3. Run:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
   On Windows PowerShell:
   ```powershell
   Copy-Item .env.example server/.env
   ```
5. Put your OpenAI key in `server/.env` if you want live AI.
6. Start both apps:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:5173`.

## Live AI configuration

Edit `server/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_TEXT_MODEL=gpt-5.6-luna
OPENAI_IMAGE_MODEL=gpt-image-2
ENABLE_IMAGE_GENERATION=true
```

If `OPENAI_API_KEY` is empty, ComicCraft automatically uses deterministic demo content, so the UI can still be tested.

## Production build

```bash
npm run build
npm start
```

The Express server serves the built client when `client/dist` exists.

## API

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/generate`
- `POST /api/projects/:id/panels/:panelId/image`
- `DELETE /api/projects/:id`

## Test

```bash
npm test
```

The tests validate the story schema and the demo generator.

## Notes

The server keeps generated projects in `server/data/projects.json`. This is intentional for a simple student/developer setup. For deployment, use a real database and object storage for images.

Never commit `.env` or an API key.

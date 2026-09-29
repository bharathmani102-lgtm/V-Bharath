# ComicCraft API

## GET /api/health

Returns API and AI configuration status.

## GET /api/projects

Returns saved projects.

## GET /api/projects/:id

Returns one project.

## POST /api/projects/generate

Example:

```json
{
  "idea": "A student finds a magical football",
  "genre": "Sports",
  "tone": "Inspiring",
  "audience": "Teen",
  "panelCount": 6,
  "visualStyle": "Modern comic book"
}
```

## POST /api/projects/:id/panels/:panelId/image

Generates artwork for one panel.

## DELETE /api/projects/:id

Deletes a project.

# Frontend - Modern Node.js Style

## Server-Rendered HTML

For simple apps, server-render HTML directly:

```javascript
import {Hono} from 'hono';
import {html} from 'hono/html';

const app = new Hono();

app.get('/', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head><title>My App</title></head>
      <body>
        <h1>Hello, ${c.req.query('name') ?? 'World'}</h1>
      </body>
    </html>
  `);
});
```

## htmx for Interactivity

Server-rendered HTML with htmx for dynamic updates (no SPA needed):

```html
<!-- Partial updates without page reload -->
<button hx-post="/api/items"
        hx-target="#item-list"
        hx-swap="beforeend">
  Add Item
</button>

<div id="item-list">
  <!-- Items rendered server-side -->
</div>
```

```javascript
// Server returns HTML fragments
app.post('/api/items', async (req, res) => {
  const item = await createItem(req.body);
  res.send(`<li id="item-${item.id}">${item.name}</li>`);
});
```

## JSON API Responses

Standard response format:

```javascript
// Success
res.json({data: users, meta: {total: 100, page: 1}});

// Error
res.status(404).json({error: 'User not found'});

// Created
res.status(201).json(user);

// No content
res.status(204).end();
```

## Static File Serving

```javascript
import {join} from 'node:path';
import express from 'express';

app.use('/static', express.static(join(import.meta.dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
}));
```

## CSS Approach

Use Tailwind CSS or vanilla CSS with modern features. No preprocessors needed:

```css
:root {
  --color-primary: oklch(60% 0.15 250);
  --color-text: oklch(20% 0 0);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: oklch(90% 0 0);
  }
}

.card {
  padding: 1rem;

  & .title { font-weight: bold; }
  &:hover { background: var(--color-primary / 0.1); }
}
```

## Template Engines

When needed, use lightweight engines:
- **eta** - Fast, lightweight, works with ESM
- **Handlebars** - Logic-less templates
- **Nunjucks** - Full-featured, Jinja2-like

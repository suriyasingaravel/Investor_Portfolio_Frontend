# React + TypeScript + Vite — Frontend README

A minimal, production-ready starter for a React + TypeScript app using Vite, with recommended developer tooling and setup instructions.

---

## Features

* React + TypeScript
* Vite for fast dev server and optimized builds
* ESLint configuration suggestions (type-aware rules)
* Recommended scripts for development, building, and testing
* Guidance for CI, environment variables, and deployment

---

## Prerequisites

* Node.js (v18+ recommended)
* npm (v9+) or yarn/pnpm
* Git

---

## Quickstart — Create the project

If you haven’t created the project yet, run:

```bash
# Using npm
npm create vite@latest my-app -- --template react-ts

# Or with pnpm
pnpm create vite@latest my-app -- --template react-ts

# Or with yarn
yarn create vite my-app --template react-ts

cd my-app
npm install
```

---

## Recommended package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## ESLint (type-aware) — suggested configuration

1. Install dev dependencies (example):

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier
```

2. Example `eslint.config.js` (basic, type-aware):

```js
import { defineConfig } from 'eslint-define-config'

export default defineConfig({
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
  },
})
```

> For stricter rules, enable `@typescript-eslint/recommended-requiring-type-checking` or integrate the `tseslint.configs.recommendedTypeChecked` from the docs you pasted.

---

## Environment variables

* Vite exposes variables prefixed with `VITE_` to the client.
* Store secrets on the server or in your hosting environment (do not commit `.env`)

Example `.env` (local development):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Access in code:

```ts
const base = import.meta.env.VITE_API_BASE_URL
```

---

## Using React Compiler (optional)

The React Compiler can give runtime performance improvements but may impact dev/build times.

If you want to try it, follow the official docs at: [https://react.dev/learn/react-compiler/installation](https://react.dev/learn/react-compiler/installation)

---

## Development

Run the dev server with:

```bash
npm run dev
```

Open `http://localhost:5173` (or the port shown by Vite).

---

## Building for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

Common deployment targets and notes:

* **Vercel / Netlify**: Connect repo and set build command to `npm run build` and publish directory to `dist`.
* **Static hosting (S3 + CloudFront)**: Upload `dist/` after `npm run build`.
* **Docker**: Build a production image that runs `vite preview` or serves `dist` with a static server (e.g., `nginx`).

Example Dockerfile (production build served by a lightweight static server):

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## CI Recommendations (GitHub Actions)

Basic workflow `ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

---

## Project structure (suggested)

```
src/
  main.tsx
  App.tsx
  index.css
  components/
  pages/
  hooks/
  utils/
  types/

public/
  index.html

package.json
tsconfig.json
.eslintrc.js
vite.config.ts
```

---

## Example `main.tsx`

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## Example `App.tsx`

```tsx
import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Welcome to React + TypeScript + Vite</h1>
    </div>
  )
}
```

---

## Troubleshooting

* **Type errors during lint/typecheck**: run `npm run typecheck` to see errors. Fix or adjust `tsconfig` and ESLint.
* **Vite dev server failing**: ensure `vite` and `@vitejs/plugin-react` are installed.
* **Environment variables not available**: confirm they start with `VITE_` and are defined in your environment.

---

## Further reading

* Vite: [https://vite.dev/](https://vite.dev/)
* React + TypeScript: [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)
* ESLint: [https://eslint.org/](https://eslint.org/)

---

If you want, I can also:

* generate a full starter `package.json`, `vite.config.ts`, and `tsconfig.json` for you,
* scaffold a sample component folder structure, or
* provide a GitHub Actions workflow file tailored to your repo.

Tell me which you'd like next.

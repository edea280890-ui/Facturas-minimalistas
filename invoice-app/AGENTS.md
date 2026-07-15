<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The application lives in the `invoice-app/` subdirectory (not the repo root). Run all `npm` commands from inside `invoice-app/`.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, plus `zustand` (state) and `@react-pdf/renderer` (PDF generation).
- Standard scripts (see `invoice-app/package.json`): `npm run dev` (dev server, port 3000), `npm run build`, `npm start`, `npm run lint`.
- Dependencies are installed by the startup update script; no manual install needed for a fresh cloud VM.

# Project Rules

## Stack
- frontend/  Next.js 14 App Router, React 18, TypeScript, TailwindCSS → Vercel
- backend/   Express 5, Mongoose 9, MongoDB Atlas, JWT httpOnly cookies → Render
- ml-service/ Flask, pdfplumber, scikit-learn, NLTK, gunicorn → Render

## Hard rules
1. Never commit secrets. `.env.example` contains placeholder values ONLY —
   never a real credential.
2. Every new backend route must have: Zod input validation, auth middleware
   where appropriate, and the standard error envelope.
3. Every DB query that touches user-owned data must be scoped by owner.
   Never call `Model.find()` bare from a controller.
4. No `any` in TypeScript. No `// @ts-ignore`.
5. Never use `dangerouslySetInnerHTML` on unsanitized content.
6. Express 5 auto-catches rejected promises in async middleware — do not add
   try/catch wrappers that swallow errors. Let them reach the error middleware.
7. All new frontend pages are Server Components by default. Add "use client"
   only to the smallest leaf component that needs interactivity.
8. Do not install a dependency without stating why. Prefer stdlib.
9. Do not refactor files outside the task's stated scope.
10. After each task, run: `npm run lint`, `npx tsc --noEmit`, and the tests.
    Fix what you broke before reporting done.

## Error envelope (backend, all errors)
{ "error": { "code": "UPPER_SNAKE", "message": "human readable",
             "details": [...], "requestId": "uuid" } }

## Response conventions
- 200 read, 201 create, 204 delete, 400 malformed, 401 unauthenticated,
  403 unauthorized, 404 missing, 409 conflict, 422 validation, 429 rate limit.
- List endpoints return { data: [...], meta: { page, limit, total, hasMore } }

## Commit style
Conventional commits: feat:, fix:, chore:, refactor:, docs:, test:
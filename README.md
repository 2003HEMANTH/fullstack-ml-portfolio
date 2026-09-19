# Full Stack ML Portfolio Platform

Next.js + Node.js + Flask + MongoDB + AWS

## Deployment

Recommended split:
- Frontend: Vercel (`frontend`)
- Backend: Render (`backend`)
- ML service: Render (`ml-service`)

### Frontend on Vercel

- Import the repo into Vercel.
- Set the project root directory to `frontend`.
- Add these environment variables:
  - `NEXT_PUBLIC_API_URL=https://<your-render-backend-url>/api`
  - `NEXT_PUBLIC_ML_URL=https://<your-render-ml-url>`

### Backend and ML service on Render

- Use the root [`render.yaml`](./render.yaml) Blueprint to create both services.
- Set the required secret values in Render:
  - Backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_NOTIFY_TO`, `CONTACT_NOTIFY_FROM`
  - ML service: `CORS_ORIGINS`

Suggested values:
- `CLIENT_URL=https://<your-vercel-frontend-url>`
- `CORS_ORIGINS=https://<your-vercel-frontend-url>`

### Sanitize existing blog content (A4)

New and updated blog HTML is sanitized by `backend/utils/sanitize.js`.
Before serving legacy posts with the new release, run the migration against
its intended database with `MONGO_URI` configured in the backend environment:

```sh
cd backend
npm run sanitize:blogs -- --dry-run
npm run sanitize:blogs
```

The script covers drafts and published posts, streams records, preserves timestamps,
and reports counts without logging content. It skips concurrent content edits and
exits unsuccessfully if any were skipped; rerun to process those records. Repeated
runs leave already sanitized content unchanged. Take a database backup before
applying the migration, since removed HTML cannot be reconstructed by the script.

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

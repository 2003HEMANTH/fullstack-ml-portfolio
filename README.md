# Full Stack ML Portfolio

Next.js frontend, Express/MongoDB portfolio API, and Flask PDF resume analyzer.

## Local setup and testing

Follow [TESTING.md](TESTING.md) for Windows setup, automated checks, and browser
acceptance tests. Email notifications are optional and currently deferred;
contact submissions are still stored in MongoDB when email is unavailable.

## Deploy

| Service | Platform | Root | Install/build | Start | Health |
|---|---|---|---|---|---|
| Frontend | Vercel (Next.js preset) | `frontend` | `npm ci`, then `npm run build` | Managed by Vercel (`npm start` locally) | `/` |
| API | Render Node web service | `backend` | `npm ci` | `npm start` | `/healthz` |
| ML | Render Python web service | `ml-service` | `pip install -r requirements.txt` | `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120 --workers 2` | `/healthz` |

Use Node 22 or newer (Mongoose 9 requires Node 20.19+), and Python 3.12.
The root [render.yaml](render.yaml) provisions the two Render services. Set the
service branch to `main`. Health checks are public liveness checks; they do not
prove MongoDB connectivity. Flask listens on port 8000 locally; Express on 5000.
Both bind to `0.0.0.0` and honor `PORT`.

### Exact environment variables

Copy each service's `.env.example` for local setup. All values in examples are
placeholders or non-secret defaults. Never commit real `.env` files.

**Backend**

- Required: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
- Set `NODE_ENV=production` on Render; use `development` locally.
- `PORT` is supplied by Render; local default is `5000`.
- One-time admin seeding: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (not required by the server).
- Optional SMTP notifications: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`,
  `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_NOTIFY_TO`, `CONTACT_NOTIFY_FROM`.
  Leave `EMAIL_USER` and `EMAIL_PASS` empty while email is deferred.
- `CLIENT_URL=https://your-site.vercel.app,http://localhost:3000` uses exact
  comma-separated origins with no trailing slash. Add preview origins explicitly.

**ML service**

- `CORS_ORIGINS=https://your-site.vercel.app,http://localhost:3000`.
- Required: `GROQ_API_KEY`, stored only in local or Render environment settings.
- Optional: `GROQ_MODEL`; defaults to `llama-3.3-70b-versatile`.
- `PORT` is supplied by Render; local default is `8000`.
- No wildcard origins. With an empty allowlist, browser-origin requests are rejected.

**Frontend**

- `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api`.
- `NEXT_PUBLIC_ML_URL=https://your-ml.onrender.com`.
- Set these in Vercel before building; public variables are embedded in the build.
  Redeploy after changing them. Neither URL should have a trailing slash.
  [Next.js environment documentation](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).

### Deployment sequence

1. Create the two Render services and configure their environment variables.
2. In Atlas, create a database user, URL-encode its password in `MONGO_URI`, and
   allow the Render service's outbound IP ranges plus your local IP for seeding.
   Find the ranges under Render's service connection details; opening access to
   every IP is not required. [Render outbound IP documentation](https://render.com/docs/outbound-ip-addresses).
3. From your local `backend` directory, point your private `.env` at the intended
   Atlas database and run `npm run seed:admin` once. The command updates the named
   admin's password if it already exists. Remove the seed password from deployment
   settings after use. Free Render services do not have dashboard shell access.
4. Run the A4 migration below against the intended database before serving legacy
   blogs. The deployment does not run migrations automatically.
5. Deploy the frontend on Vercel with both public URLs. Add its exact HTTPS origin
   to `CLIENT_URL` and `CORS_ORIGINS`, then redeploy/restart affected services.
6. Run the production smoke tests in [TESTING.md](TESTING.md).

Production auth cookies use `HttpOnly`, `Secure`, `SameSite=None`, and `Path=/`.
If login does not survive refresh, inspect `/api/auth/me`, CORS credentials, the
cookie's attributes, and browser third-party-cookie restrictions. Correct flags
alone cannot override a browser policy that blocks third-party cookies.

Free Render instances can sleep. The analyzer warms `/healthz` on page mount,
allows 90 seconds for requests, and explains slow starts after five seconds.
An uptime monitor is optional; it is not a guarantee against cold starts or free
instance limits. Render's free services also block SMTP ports 25/465/587, so Gmail
SMTP will need a suitable paid runtime or a future HTTPS email-provider integration.
[Render free-service limitations](https://render.com/docs/free).

## Deferred work

Admin edit UI, draft management, contact inbox UI, pagination, SEO/sitemap,
image optimization, animation performance, richer matching, refresh tokens,
and CI remain deferred. Automated tests now exist for the backend, ML service,
and frontend error handling; live database and production checks remain separate.

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

### ML upload hardening (A5)

`POST /analyze` accepts PDF bytes in the `resume` multipart field. Requests are
limited to 5 MiB including multipart overhead. Uploads remain in memory, and
extraction stops at 30 pages or 200,000 characters. Encrypted PDFs are rejected,
even when their user password is empty.

Parsing runs in a disposable child process supervised by a `ThreadPoolExecutor`
with a 20-second future timeout. The child is terminated on timeout; a thread
alone cannot stop a hung parser. Each web worker permits at most two active
parsers, returning 503 `PARSER_BUSY` when full. Process startup and cleanup add
some overhead to the parsing deadline. This isolates parser execution but is
not an operating-system sandbox or a hard memory limit on decompressed PDFs.

Set `CORS_ORIGINS` to comma-separated, exact frontend origins. An empty setting
allows no browser origins; `*` is rejected. Errors use the backend envelope
`{ error: { code, message, details, requestId } }` with an `X-Request-Id` header.
Neither uploaded bytes nor extracted text are written to disk or logged. Resume text and an optional job description are sent to Groq for AI analysis; the portfolio service does not persist them. Job descriptions are limited to 20,000 characters, and provider failures use structured `AI_*` errors.

Run the ML tests with the service dependencies installed:

```sh
cd ml-service
python -m unittest discover -s tests -v
```

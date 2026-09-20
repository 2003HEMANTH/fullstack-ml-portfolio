# Test the post-A5 release

Run these instructions in Windows PowerShell. Use `npm.cmd` and `npx.cmd` if
PowerShell blocks the `npm.ps1` launcher. Do not paste credentials into Git or chat.

## 1. Configure a local environment

Install Node 22+ and Python 3.12 if absent. From the repository root, copy these
files only if the destination does not already exist:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item ml-service/.env.example ml-service/.env
```

Edit `backend/.env`: fill in the Atlas `MONGO_URI`, a long random `JWT_SECRET`,
`ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Use `NODE_ENV=development` and
`CLIENT_URL=http://localhost:3000`. Allow your current IP in Atlas Network Access.
Keep `EMAIL_USER` and `EMAIL_PASS` blank; email setup is deferred. The frontend
and ML example URLs already match the three local ports. In `ml-service/.env`, set your private `GROQ_API_KEY`; never commit it.

Install dependencies, each in its service directory:

```powershell
cd backend
npm.cmd ci
npm.cmd run seed:admin
cd ../frontend
npm.cmd ci
cd ../ml-service
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Seeding requires a reachable MongoDB database. It updates the supplied admin's
password on reruns. Use a test database for create/delete testing.

## 2. Run automated checks

From `backend`:

```powershell
npm.cmd test
```

From `frontend`:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd test
npm.cmd run build
```

From `ml-service`:

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -v
```

The backend HTTP tests use database stand-ins and do not prove Atlas connectivity.
The ML tests generate PDFs in memory and include encryption, upload limits,
parser termination, and a subsequent successful parse. Frontend tests cover error
normalization, ML messages, rate limits, timeout configuration, and multipart uploads.
Image lint warnings are known; there should be no lint errors.

## 3. Start three terminals

Terminal 1, repository root:

```powershell
cd backend
npm.cmd run dev
```

Terminal 2, repository root:

```powershell
cd ml-service
.\venv\Scripts\python.exe app.py
```

Terminal 3, repository root:

```powershell
cd frontend
npm.cmd run dev
```

Wait for MongoDB to connect, Flask to listen on 8000, and Next.js to become ready.
Open http://localhost:3000. Use `localhost` consistently rather than mixing it
with `127.0.0.1`, since cookies and CORS origins depend on the hostname.

## 4. Check HTTP responses

In another terminal:

```powershell
curl.exe -i http://localhost:5000/healthz
curl.exe -i http://localhost:8000/healthz
curl.exe -i 'http://localhost:5000/api/projects?foo=bar'
curl.exe -i http://localhost:5000/api/projects/notanid
curl.exe -i -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' --data '{}'
```

Expect: 200 `ok`, 200 health JSON, 200 project JSON, 400 `INVALID_ID`, and 422
`VALIDATION_ERROR` with non-empty `{ field, message }` details. All API errors
include a request ID matching `X-Request-Id`.

To test the login limit, restart the local backend to reset its in-memory counters,
then run exactly six invalid attempts (these do not need a valid password):

```powershell
1..6 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}\n" -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' --data '{}'
}
```

Expect five 422 responses then 429. Restart again before normal login testing,
or wait 15 minutes. Do not use repeated tests to lock out your production admin.

## 5. Browser acceptance tests

1. Open `/home`, `/projects`, `/blog`, and `/contact`. Empty lists should show
   readable empty states, and loading should not leave a blank page.
2. In a private/logged-out window, open `/admin/dashboard` and
   `/admin/dashboard/blog`. Both should show a session check then redirect to `/admin`.
3. Log in at `/admin` with the seeded credentials. Refresh the dashboard; the
   session should remain valid. Create a test project and a published test blog,
   confirm both appear publicly, and delete only those test records.
4. Visit `/blog/garbage`, `/blog/000000000000000000000000`, and a nonexistent
   route. Expect the styled 404 page. The all-zero ID assumes no such record exists.
5. Submit the contact form. Expect success and a stored MongoDB contact record.
   Do not expect email delivery until email is configured. After three submissions
   in an hour the contact limiter will reject more requests.
6. Stop the backend and load `/projects` or `/blog` again. Expect a readable error,
   not `undefined` or a misleading empty-list message. Restart the backend afterward.
7. Log out. In DevTools > Application > Cookies, verify the `token` cookie is gone.
   Revisit the dashboard and confirm the login redirect.

## 6. Resume analyzer

- Upload a normal text-based PDF. Expect an AI ATS score, strengths, weaknesses, section feedback, suggestions, and bullet rewrites.
- Paste a job description before upload. Expect a JD match score plus matched and missing keywords.
- Upload an encrypted PDF. Expect the password-protection message.
- Upload a scanned/image-only PDF. Expect the text-based export instructions.
- Upload a file larger than 5 MiB. Expect the size message.
- Rename a text file to `.pdf` and upload it. Expect the non-PDF message.
- Stop Flask, then upload. Expect the analyzer-unreachable message.
- For cold-start feedback, throttle the network in DevTools (or test after the
  deployed ML service has slept). After five seconds the wakeup explanation should
  appear. The client allows 90 seconds; actual PDF extraction has a 20-second cap.
- For a deterministic parser-timeout check, run the ML automated suite: it launches
  a deliberately hanging test worker, kills it, and verifies recovery.

The file picker can reject a non-PDF MIME type before the server. To exercise the
server's byte validation directly, use a disposable text fixture:

```powershell
Set-Content -Path "$env:TEMP/fake-resume.pdf" -Value 'not a PDF'
curl.exe -i -F "resume=@$env:TEMP/fake-resume.pdf" http://localhost:8000/analyze
```

Expect 400 `FILE_NOT_PDF` in the standard JSON envelope. Uploaded resumes are not
written to disk by the service; this command creates only your local test fixture.

## 7. Legacy blog migration

With `backend/.env` pointing to the intended database, take a backup, then run:

```powershell
cd backend
npm.cmd run sanitize:blogs -- --dry-run
npm.cmd run sanitize:blogs
npm.cmd run sanitize:blogs -- --dry-run
```

The final dry run should report `changed: 0` unless posts were edited concurrently.
The migration removes unsafe HTML from existing records; it has not been run
against your live database as part of the code checks.

## 8. Production smoke test

Follow the deployment table and environment list in README.md. Confirm both
`/healthz` URLs work over HTTPS, then repeat the browser and PDF checks on Vercel.
Refresh after admin login and inspect cookies/CORS if the session fails. Browser
third-party-cookie blocking can affect Vercel-to-Render auth even with correct flags.
Set the actual service URLs before building the frontend, and redeploy after changes.
Email verification remains deferred. Do not call a deployment verified until
Atlas reads, authenticated writes, and a real PDF upload succeed against it.

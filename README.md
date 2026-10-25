# HR System Backend

## Configure MongoDB

1. Install and start MongoDB locally, or create a MongoDB Atlas cluster.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` in `.env`:
   - Local: `mongodb://127.0.0.1:27017/hr_system`
   - Atlas: paste your cluster connection string and include the database name.
4. From this directory, run `npm install` and then `npm run dev`.

The API only starts after MongoDB connects. Check `/api/health` for API and
database readiness. The existing `DATABASE_URL` value in `.env` is used as-is.

## Registration API

`POST /api/register` accepts JSON with `username`, `email`, and `password`.
Yup validates the request, usernames and email addresses are stored in
lowercase, passwords are hashed with bcrypt, and duplicates return
`409 Conflict`. Successful requests return `201 Created` with the new user's
ID, username, and email, and set a signed JWT in an HttpOnly cookie.

`GET /api/auth/me` returns the current user from the session cookie.
`POST /api/auth/logout` clears the cookie. Set `JWT_SECRET` in `.env` to a
random secret of at least 32 characters; do not commit or share it.

`POST /api/role` accepts `{"role":"employee"}`, `{"role":"hr"}`, or
`{"role":"admin","adminPassword":"..."}` from an authenticated user. Employee
and HR are saved immediately. Admin is saved only when the submitted password
matches the server-only `ADMIN_ROLE_PASSWORD` setting in `.env`. Never expose
that password in frontend code or commit it to source control.

Run the frontend with `npm run dev` from `HR-system`; its Vite proxy forwards
`/api` requests to the backend at `http://localhost:5000`.

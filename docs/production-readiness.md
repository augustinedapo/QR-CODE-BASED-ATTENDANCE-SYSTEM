# Production Readiness Plan

This app now works well for local SQLite-backed development, but production should move the volatile pieces out of the app process.

## Database

- Use PostgreSQL instead of SQLite for production.
- Required environment variables:
  - `DATABASE_URL`
  - `DJANGO_SECRET_KEY`
  - `DEBUG=False`
  - `ALLOWED_HOSTS`
  - `CORS_ALLOWED_ORIGINS`
- Keep SQLite only for local development and quick demos.
- Add scheduled backups before onboarding real students.

## Background Jobs

- Use Redis as the Celery broker/result backend.
- Good Celery jobs for this app:
  - expire old QR sessions
  - generate large reports asynchronously
  - send notification email digests
  - clean old scan attempts/geolocation logs according to the retention policy

## Live Attendance

- Current implementation uses polling every few seconds, which is simple and reliable for the current scope.
- Upgrade path:
  - Redis + Django Channels for WebSockets
  - one attendance room per active lecture
  - broadcast present/absent/total updates after each successful scan

## Security

- Serve only over HTTPS.
- Keep lecturer/student location data only for validation and audit needs.
- Add a retention policy for geolocation logs and rejected scan attempts.
- Add rate limits for login, registration, QR scan, and report generation endpoints.
- Store secrets in the hosting provider secret manager, not in `.env` committed files.

## Testing And CI

- Run before deployment:
  - `venv\Scripts\python.exe Backend\manage.py check`
  - `venv\Scripts\python.exe Backend\manage.py test accounts courses attendance`
  - `npm run lint`
  - `npm run build`
- Add CI to run these checks on every pull request.
- Add frontend tests once a test runner is installed.

## Deployment Checklist

- Apply migrations.
- Create the first admin user.
- Verify `/api/schema/` and `/api/docs/`.
- Verify registration, login, course creation, enrollment, QR generation, scan success, scan rejection, notifications, and report export.
- Confirm mobile camera/location prompts on real Android and iOS browsers.

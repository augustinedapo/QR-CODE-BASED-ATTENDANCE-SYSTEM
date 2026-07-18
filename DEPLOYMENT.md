# Deployment Guide

This guide deploys the QR Code Based Lecture Attendance System as a student project using free hosting URLs.

Recommended setup:

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL
- Repository: GitHub

## 1. Deployment Architecture

The application is deployed as two separate services:

- The Next.js frontend is hosted on Vercel.
- The Django REST API backend is hosted on Render.
- The backend connects to a PostgreSQL database.
- The frontend calls the backend using `NEXT_PUBLIC_API_URL`.

Request flow:

```text
Browser -> Vercel Frontend -> Render Backend API -> PostgreSQL Database
```

## 2. Backend Preparation

The backend is located in the `Backend` folder.

Production support has been added for:

- PostgreSQL through `DATABASE_URL`
- Gunicorn as the production WSGI server
- WhiteNoise for static files
- Render deployment using `render.yaml`
- Environment-based `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`

Local development still uses SQLite if `DATABASE_URL` is not set.

## 3. Backend Environment Variables

Set these variables in Render or your backend host:

```env
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DEBUG=False
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
ALLOWED_HOSTS=your-backend-host.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
SECURE_SSL_REDIRECT=True
```

For local development, copy `Backend/.env.example` to `Backend/.env` and adjust values.

## 4. Backend Build and Start Commands

If deploying manually on Render, use:

Build command:

```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
```

Start command:

```bash
gunicorn qr_attendance_config.wsgi:application
```

If using the included `render.yaml`, Render can detect the backend service and PostgreSQL database from the blueprint. The blueprint runs the build script with `bash build.sh`, so it does not depend on Windows file permissions.

On Linux-based hosts, if you choose to execute `build.sh` directly, ensure it is executable:

```bash
chmod +x Backend/build.sh
```

## 5. PostgreSQL Setup

Create a PostgreSQL database on Render, Railway, Neon, or another provider.

Copy its connection string into the backend environment variable:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
```

After deployment, run migrations if the host does not run the build script automatically:

```bash
python manage.py migrate
```

## 6. Frontend Preparation

The frontend is located in the `frontend` folder.

Set this environment variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend-host.onrender.com/api
```

For local development, copy `frontend/.env.example` to `frontend/.env.local`.

## 7. Frontend Build Settings on Vercel

Use these settings:

- Framework preset: Next.js
- Root directory: `frontend`
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave as Vercel default

## 8. Deployment Order

1. Push the project to GitHub.
2. Create PostgreSQL database.
3. Deploy backend first.
4. Add backend environment variables.
5. Run backend migrations.
6. Copy the backend URL.
7. Deploy frontend on Vercel.
8. Add `NEXT_PUBLIC_API_URL` to Vercel.
9. Test the full workflow.

## 9. Post-Deployment Test Checklist

Test these flows after deployment:

- Student registration with matric number format `CPE/YY/XXXX`
- Lecturer registration with employee ID
- Login for student and lecturer
- Lecturer course registration
- Student course enrollment
- QR code generation
- Student QR scan and attendance marking
- Duplicate scan rejection
- Poor GPS accuracy rejection
- Student scan history
- Lecturer course QR attendance history
- Attendance export/report generation
- Profile/settings update

## 10. Known Deployment Limitations

For a free student-project deployment:

- Free backend services may sleep after inactivity.
- SQLite should not be used for hosted production; PostgreSQL is recommended and now supported.
- Uploaded avatar/media files may not persist permanently on some free hosts unless external media storage is added.
- Live attendance currently uses polling, not WebSockets.
- Background workers such as Celery are not deployed in this setup.

## 11. Recommended Future Production Improvements

For real institutional use, add:

- Managed PostgreSQL with backups
- Object storage for media uploads
- Redis and Celery for background jobs
- Django Channels/WebSockets for live attendance
- CI/CD pipeline
- Rate limiting
- Error monitoring
- HTTPS-only custom domain

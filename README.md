Updated README with Phase 2 server endpoints notes.

Server endpoints added:
- POST /api/admin/generate-student-id  (requires Bearer token of admin user)
- POST /api/admin/approve-payment      (requires Bearer token of admin user, body: { paymentId })
- POST /api/admin/generate-certificate (requires Bearer token of admin user, body: { userId, courseId })

To use these endpoints locally, set FIREBASE_ADMIN_* environment variables in your .env.local.

Do not commit your Firebase Admin private key. Use environment variables or secrets in your deployment platform.

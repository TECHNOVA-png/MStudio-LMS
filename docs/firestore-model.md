# Firestore data model

This document outlines the Firestore collections and document shapes used by M Studio.

Collections:

- users/{uid}
  - studentId: string
  - name, email, phone, country
  - role: "student" | "admin"
  - enrolledCourses: [{ courseId, purchasedAt, progress }]
  - createdAt

- courses/{courseId}
  - slug, title, description, shortDescription
  - price, currency
  - instructor: { id, name, bio, avatarUrl }
  - duration, rating, studentsCount
  - imageUrl
  - modules: [{ id, title, lessons: [{ id, title, type, content, videoUrl, resources }] }]
  - isPublished
  - createdAt, updatedAt

- payments/{paymentId}
  - userId, courseId, amount, currency, method
  - screenshotUrl
  - status: pending | approved | rejected
  - createdAt, approvedAt, approvedBy

- certificates/{certId}
  - userId, courseId, issuedAt, certificateSerial, pdfUrl

- community/{courseId}/posts/{postId}
  - authorId, text, attachments, pinned, createdAt

- announcements/{courseId}/{announcementId}
  - title, content, pinned, createdAt

- zoom-sessions/{courseId}/{sessionId}
  - meetingId, meetingLink, startTime, duration, host, recordingUrl, attendance

Meta counters (for generating sequential IDs)
- meta/counters
  - studentCounter: number

Use the provided seeder script to populate sample courses (scripts/seed-sample-courses.js).

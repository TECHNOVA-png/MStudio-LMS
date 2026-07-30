#!/usr/bin/env node
/**
 * Integration smoke tests using Firebase Admin SDK.
 * This script runs simple operations to validate Firestore and Storage integration.
 * Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY and other NEXT_PUBLIC_* vars in your environment and run:
 * node scripts/integration-smoke.js
 */

const admin = require('firebase-admin');

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
  console.error('Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in env');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

async function run(){
  try{
    console.log('Starting integration smoke tests');

    // Create admin user if not exists
    const adminEmail = `integration-admin+${Date.now()}@example.com`;
    console.log('Creating admin user:', adminEmail);
    const userRecord = await auth.createUser({ email: adminEmail, password: 'Test1234!' });
    await db.collection('users').doc(userRecord.uid).set({ name: 'Integration Admin', email: adminEmail, role: 'admin', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('Admin user created:', userRecord.uid);

    // Seed one course
    const courseRef = db.collection('courses').doc();
    await courseRef.set({ title: 'Integration Test Course', slug: `integration-${Date.now()}`, description: 'Seed for integration tests', shortDescription: 'Integration', price: 100, currency: 'PKR', imageUrl: '', duration: '1h', modules: [], isPublished: true, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('Seeded course:', courseRef.id);

    // Create student user
    const studentEmail = `integration-student+${Date.now()}@example.com`;
    const student = await auth.createUser({ email: studentEmail, password: 'Test1234!' });
    await db.collection('users').doc(student.uid).set({ name: 'Integration Student', email: studentEmail, role: 'student', enrolledCourses: [], createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('Student created:', student.uid);

    // Create payment doc
    const paymentRef = db.collection('payments').doc();
    await paymentRef.set({ userId: student.uid, courseId: courseRef.id, amount: 100, currency: 'PKR', method: 'bank_transfer', screenshotUrl: '', status: 'pending', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('Payment doc created:', paymentRef.id);

    // Test approve logic (transaction)
    await admin.firestore().runTransaction(async (t)=>{
      const p = await t.get(paymentRef);
      if(!p.exists) throw new Error('Payment doc missing');
      t.update(paymentRef, { status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp(), approvedBy: userRecord.uid });
      const userRef = db.collection('users').doc(student.uid);
      t.update(userRef, { enrolledCourses: admin.firestore.FieldValue.arrayUnion({ courseId: courseRef.id, purchasedAt: admin.firestore.FieldValue.serverTimestamp(), progress: 0 }) });
    });
    console.log('Payment approved and user enrolled');

    // Upload a small buffer as a test file
    const file = bucket.file(`integration/${Date.now()}_test.txt`);
    await file.save('integration test content', { contentType: 'text/plain' });
    console.log('Uploaded test file to storage:', file.name);

    // Verify file exists
    const [exists] = await file.exists();
    if(!exists) throw new Error('File not found after upload');
    console.log('Storage file exists check passed');

    console.log('Integration smoke tests completed successfully');
    process.exit(0);
  }catch(err){
    console.error('Integration tests failed:', err);
    process.exit(2);
  }
}

run();

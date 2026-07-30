#!/usr/bin/env node

/**
 * Seed sample courses using Firebase Admin SDK.
 * Usage: Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in env and run:
 * node scripts/seed-sample-courses.js
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
  })
});

const db = admin.firestore();

async function seed(){
  const courses = [
    { title: 'React & Next.js', slug: 'react-nextjs', description: 'Build modern React apps with Next.js', shortDescription: 'React + Next.js', price: 19900, imageUrl: '', duration: '12h' },
    { title: 'Shopify Masterclass', slug: 'shopify-masterclass', description: 'Launch your e-commerce store on Shopify', shortDescription: 'Shopify', price: 24900, imageUrl: '', duration: '10h' }
  ];

  for(const c of courses){
    const ref = db.collection('courses').doc();
    await ref.set({ ...c, modules: [], rating: 0, studentsCount: 0, isPublished: true, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('created', ref.id);
  }
  console.log('Done');
}

seed().catch((e)=>{ console.error(e); process.exit(1); });

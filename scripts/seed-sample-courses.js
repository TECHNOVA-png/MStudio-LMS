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
    {
      title: 'React & Next.js',
      slug: 'react-nextjs',
      description: 'Build modern React apps with Next.js',
      shortDescription: 'React + Next.js fundamentals and advanced patterns',
      price: 19900,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      duration: '12h',
      modules: [
        {
          id: 'm1',
          title: 'Introduction & Theory',
          lessons: [
            { id: 'l1', title: 'Why React & Next.js?', type: 'theory', content: 'React and Next.js enable fast, scalable web applications by combining component-driven UI with server-side rendering, static generation, and a rich plugin ecosystem. In this lesson we will cover the core concepts and when to use them.', duration: 20 },
            { id: 'l2', title: 'Setup & Project Structure', type: 'theory', content: 'Learn how to structure a Next.js project, conventions, and tooling (TypeScript, ESLint, Prettier, Tailwind).', duration: 15 },
            { id: 'l3', title: 'Hands-on: Create your first Next app', type: 'video', videoUrl: '' }
          ]
        },
        {
          id: 'm2',
          title: 'Advanced Patterns',
          lessons: [
            { id: 'l4', title: 'Data Fetching Strategies', type: 'theory', content: 'Understand SSR, SSG, ISR, and client-side fetching with SWR and React Query.', duration: 25 },
            { id: 'l5', title: 'Performance & Optimization', type: 'theory', content: 'Code splitting, image optimization, and monitoring performance.', duration: 30 }
          ]
        }
      ]
    },
    {
      title: 'Shopify Masterclass',
      slug: 'shopify-masterclass',
      description: 'Launch your e-commerce store on Shopify',
      shortDescription: 'Shopify store building, themes, and app integrations',
      price: 24900,
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      duration: '10h',
      modules: [
        {
          id: 'm1',
          title: 'Shopify Basics',
          lessons: [
            { id: 'l1', title: 'Getting started with Shopify', type: 'theory', content: 'Overview of Shopify concepts: stores, themes, products, collections, and the admin panel.', duration: 20 },
            { id: 'l2', title: 'Product Modeling', type: 'theory', content: 'How to structure products, variants, and collections for flexible catalogs.', duration: 18 }
          ]
        },
        {
          id: 'm2',
          title: 'Theme & Storefront',
          lessons: [
            { id: 'l3', title: 'Theme customization', type: 'theory', content: 'Customize themes using Liquid, CSS, and JavaScript. Best practices for responsive storefronts.', duration: 25 },
            { id: 'l4', title: 'App integrations', type: 'theory', content: 'Integrate third-party apps for payments, analytics, and fulfillment.', duration: 22 }
          ]
        }
      ]
    }
  ];

  for(const c of courses){
    const ref = db.collection('courses').doc();
    await ref.set({
      title: c.title,
      slug: c.slug,
      description: c.description,
      shortDescription: c.shortDescription,
      price: c.price,
      currency: 'PKR',
      imageUrl: c.imageUrl,
      duration: c.duration,
      modules: c.modules,
      rating: 0,
      studentsCount: 0,
      isPublished: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('created', ref.id, c.title);
  }
  console.log('Done');
}

seed().catch((e)=>{ console.error(e); process.exit(1); });

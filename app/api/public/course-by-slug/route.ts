import { NextResponse } from 'next/server';
import admin from '../../../../lib/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const snap = await admin.firestore().collection('courses').where('slug', '==', slug).limit(1).get();
    if (snap.empty) return NextResponse.json({ course: null });
    const doc = snap.docs[0];
    return NextResponse.json({ course: { id: doc.id, ...doc.data() } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

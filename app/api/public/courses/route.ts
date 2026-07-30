import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';

export async function GET() {
  try {
    const snap = await admin.firestore().collection('courses').where('isPublished', '==', true).get();
    const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ courses });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

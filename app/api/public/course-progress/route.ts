import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    // Require Authorization header to read user progress
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const docRef = admin.firestore().collection('user_progress').doc(uid).collection('courses').doc(courseId);
    const snap = await docRef.get();
    if(!snap.exists) return NextResponse.json({ lessonsCompleted: [], lastLesson: null });
    const data = snap.data() || {};
    return NextResponse.json({ lessonsCompleted: data.lessonsCompleted || [], lastLesson: data.lastLesson || null });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const body = await req.json();
    const { courseId, lessonId } = body;
    if (!courseId || !lessonId) return NextResponse.json({ error: 'courseId and lessonId required' }, { status: 400 });

    const progressRef = admin.firestore().collection('user_progress').doc(uid).collection('courses').doc(courseId);
    await progressRef.set({
      lessonsCompleted: admin.firestore.FieldValue.arrayUnion(lessonId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

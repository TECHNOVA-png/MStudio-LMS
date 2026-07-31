import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';

// Returns a media URL for a lesson only if the requesting user is enrolled in the course.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    if (!courseId || !lessonId) return NextResponse.json({ error: 'courseId and lessonId required' }, { status: 400 });

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // check enrollment
    const userSnap = await admin.firestore().collection('users').doc(uid).get();
    const user = userSnap.exists ? userSnap.data() : null;
    const enrolled = user && Array.isArray(user.enrolledCourses) && user.enrolledCourses.some((c:any)=> c.courseId === courseId);
    if(!enrolled) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const courseSnap = await admin.firestore().collection('courses').doc(courseId).get();
    if(!courseSnap.exists) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    const course = courseSnap.data() || {};

    // find lesson
    let target = null;
    (course.modules || []).forEach((m:any)=>{
      (m.lessons || []).forEach((l:any)=>{ if(l.id === lessonId) target = l; });
    });
    if(!target) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    // if videoUrl looks like a storage path (course_media/...), generate signed URL
    const bucket = admin.storage().bucket();
    if(target.videoUrl && (target.videoUrl.startsWith('course_media/') || target.videoUrl.startsWith('user_uploads/'))){
      const file = bucket.file(target.videoUrl);
      const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
      return NextResponse.json({ url, path: target.videoUrl });
    }

    // if content field looks like a storage path
    if(target.content && (target.content.startsWith('course_media/') || target.content.startsWith('user_uploads/'))){
      const file = bucket.file(target.content);
      const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
      return NextResponse.json({ url, path: target.content });
    }

    // otherwise return the provided URL or content directly
    return NextResponse.json({ url: target.videoUrl || target.content || null });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

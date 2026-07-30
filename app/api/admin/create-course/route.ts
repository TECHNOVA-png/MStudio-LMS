import { NextResponse } from 'next/server';
import admin, { adminAuth, adminDb } from '../../../lib/admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const userRef = adminDb.collection('users').doc(decoded.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : null;
    if (!userData || userData.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      title,
      slug,
      description,
      shortDescription,
      price,
      currency = 'PKR',
      imageUrl = '',
      instructor = null,
      duration = ''
    } = body;

    if (!title || !slug || !description) return NextResponse.json({ error: 'title, slug and description are required' }, { status: 400 });

    const courseRef = adminDb.collection('courses').doc();
    const courseData = {
      title,
      slug,
      description,
      shortDescription: shortDescription || '',
      price: typeof price === 'number' ? price : Number(price) || 0,
      currency,
      instructor,
      duration,
      rating: 0,
      studentsCount: 0,
      imageUrl,
      modules: [],
      isPublished: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await courseRef.set(courseData);
    return NextResponse.json({ id: courseRef.id, ...courseData });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

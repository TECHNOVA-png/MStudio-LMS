import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';
import { verifyAdminToken } from '../../../lib/adminHelpers';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await verifyAdminToken(token);

    const body = await req.json();
    const { id, title, slug, description, shortDescription, price, currency = 'PKR', imageUrl = '', duration = '' } = body;
    if (!title || !slug || !description) return NextResponse.json({ error: 'title, slug and description are required' }, { status: 400 });

    const courses = admin.firestore().collection('courses');

    if (id) {
      const ref = courses.doc(id);
      await ref.update({
        title,
        slug,
        description,
        shortDescription: shortDescription || '',
        price: typeof price === 'number' ? price : Number(price) || 0,
        currency,
        imageUrl,
        duration,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return NextResponse.json({ id, updated: true });
    } else {
      const ref = courses.doc();
      await ref.set({
        title,
        slug,
        description,
        shortDescription: shortDescription || '',
        price: typeof price === 'number' ? price : Number(price) || 0,
        currency,
        imageUrl,
        duration,
        rating: 0,
        studentsCount: 0,
        modules: [],
        isPublished: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return NextResponse.json({ id: ref.id, created: true });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

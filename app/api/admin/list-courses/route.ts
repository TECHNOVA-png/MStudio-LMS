import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';
import { verifyAdminToken } from '../../../lib/adminHelpers';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await verifyAdminToken(token);

    const snap = await admin.firestore().collection('courses').get();
    const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ courses });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

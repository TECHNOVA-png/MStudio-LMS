import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';
import { verifyAdminToken } from '../../../lib/adminHelpers';

export async function POST(req: Request) {
  try {
    await verifyAdminToken(req.headers.get('authorization')?.replace('Bearer ', '') || '');
    const body = await req.json();
    const { courseId, userId, name } = body;
    if (!courseId || !userId || !name) return NextResponse.json({ error: 'courseId, userId and name required' }, { status: 400 });

    const certRef = admin.firestore().collection('certificates').doc();
    const certId = certRef.id;
    await certRef.set({ courseId, userId, issuedAt: admin.firestore.FieldValue.serverTimestamp(), certificateSerial: `MS-CERT-${Date.now()}`, pdfUrl: null, name });

    return NextResponse.json({ certId });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

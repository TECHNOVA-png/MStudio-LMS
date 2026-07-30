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
    const { userId, courseId } = body;
    if (!userId || !courseId) return NextResponse.json({ error: 'userId and courseId required' }, { status: 400 });

    const certRef = admin.firestore().collection('certificates').doc();
    const certId = certRef.id;
    await certRef.set({ userId, courseId, issuedAt: admin.firestore.FieldValue.serverTimestamp(), certificateSerial: `MS-CERT-${Date.now()}`, pdfUrl: null });

    return NextResponse.json({ certId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

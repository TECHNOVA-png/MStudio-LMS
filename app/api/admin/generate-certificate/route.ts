import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    // ensure admin role
    const userRef = adminDb.collection('users').doc(decoded.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : null;
    if (!userData || userData.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { userId, courseId } = body;
    if (!userId || !courseId) return NextResponse.json({ error: 'userId and courseId required' }, { status: 400 });

    const certRef = adminDb.collection('certificates').doc();
    const certId = certRef.id;
    await certRef.set({ userId, courseId, issuedAt: adminDb.FieldValue.serverTimestamp(), certificateSerial: `MS-CERT-${Date.now()}`, pdfUrl: null });

    return NextResponse.json({ certId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

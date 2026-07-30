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
    const { paymentId } = body;
    if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 });

    const paymentRef = adminDb.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    const payment = paymentSnap.data();

    // Approve transactionally
    await adminDb.runTransaction(async (t) => {
      t.update(paymentRef, { status: 'approved', approvedAt: adminDb.FieldValue.serverTimestamp(), approvedBy: decoded.uid });
      const userRefTarget = adminDb.collection('users').doc((payment as any).userId);
      t.update(userRefTarget, { enrolledCourses: adminDb.FieldValue.arrayUnion({ courseId: (payment as any).courseId, purchasedAt: adminDb.FieldValue.serverTimestamp(), progress: 0 }) });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

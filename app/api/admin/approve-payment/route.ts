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
    const { paymentId } = body;
    if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 });

    const paymentRef = admin.firestore().collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    const payment = paymentSnap.data();

    // Approve transactionally
    await admin.firestore().runTransaction(async (t) => {
      t.update(paymentRef, { status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp(), approvedBy: (await verifyAdminToken(token)).uid });
      const userRefTarget = admin.firestore().collection('users').doc((payment as any).userId);
      t.update(userRefTarget, { enrolledCourses: admin.firestore.FieldValue.arrayUnion({ courseId: (payment as any).courseId, purchasedAt: admin.firestore.FieldValue.serverTimestamp(), progress: 0 }) });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

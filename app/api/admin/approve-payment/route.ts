import { NextResponse } from 'next/server';
import admin from '../../../../lib/admin';
import { verifyAdminToken } from '../../../../lib/adminHelpers';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await verifyAdminToken(token);

    const body = await req.json();
    const { paymentId } = body;
    if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 });

    const db = admin.firestore();
    const paymentRef = db.collection('payments').doc(paymentId);

    await db.runTransaction(async (t) => {
      const pSnap = await t.get(paymentRef);
      if (!pSnap.exists) throw new Error('Payment not found');
      const payment = pSnap.data();
      if (!payment) throw new Error('Invalid payment');
      if (payment.status === 'approved') return;

      // mark payment approved
      t.update(paymentRef, { status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp() });

      // enroll user
      const userRef = db.collection('users').doc(payment.userId);
      t.update(userRef, { enrolledCourses: admin.firestore.FieldValue.arrayUnion({ courseId: payment.courseId, purchasedAt: admin.firestore.FieldValue.serverTimestamp(), progress: 0 }) });

      // increment course studentsCount
      const courseRef = db.collection('courses').doc(payment.courseId);
      t.update(courseRef, { studentsCount: admin.firestore.FieldValue.increment(1) });
    });

    return NextResponse.json({ success: true });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

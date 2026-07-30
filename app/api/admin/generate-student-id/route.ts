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

    // Transaction for unique student id
    const countersRef = adminDb.collection('meta').doc('counters');
    const result = await adminDb.runTransaction(async (t) => {
      const d = await t.get(countersRef);
      let last = 1000;
      if (d.exists) last = d.data().studentCounter || last;
      const next = last + 1;
      t.set(countersRef, { studentCounter: next }, { merge: true });
      const studentId = `MS${next}`;
      return { studentId };
    });

    return NextResponse.json({ studentId: result.studentId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

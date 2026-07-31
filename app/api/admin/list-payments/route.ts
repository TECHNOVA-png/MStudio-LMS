import { NextResponse } from 'next/server';
import admin from '../../../../lib/admin';
import { verifyAdminToken } from '../../../../lib/adminHelpers';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await verifyAdminToken(token);

    const snaps = await admin.firestore().collection('payments').orderBy('createdAt', 'desc').limit(200).get();
    const payments = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ payments });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

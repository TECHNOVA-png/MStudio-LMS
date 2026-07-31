import { NextResponse } from 'next/server';
import admin from '../../../lib/admin';
import { verifyAdminToken } from '../../../lib/adminHelpers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    // verify admin
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyAdminToken(token);

    const bucket = admin.storage().bucket();
    const prefix = `course_media/${courseId}/`;
    const [files] = await bucket.getFiles({ prefix });
    const list = files.map(f=>({ name: f.name, path: f.name, size: f.metadata && f.metadata.size ? Number(f.metadata.size) : null }));
    return NextResponse.json({ files: list });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

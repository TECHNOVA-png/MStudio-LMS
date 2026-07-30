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
    const { filename, contentType, courseId } = body;
    if (!filename || !contentType || !courseId) return NextResponse.json({ error: 'filename, contentType and courseId are required' }, { status: 400 });

    const bucket = admin.storage().bucket();
    const filePath = `course_media/${courseId}/${Date.now()}_${filename}`;
    const file = bucket.file(filePath);

    // generate signed URL valid for 15 minutes
    const [url] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType
    });

    return NextResponse.json({ uploadUrl: url, path: filePath });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

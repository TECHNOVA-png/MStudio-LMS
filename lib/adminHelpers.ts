import admin from './admin';
import { adminAuth, adminDb } from './admin';

export async function verifyAdminToken(token: string) {
  if (!token) throw new Error('No token');
  const decoded = await adminAuth.verifyIdToken(token);
  const userRef = adminDb.collection('users').doc(decoded.uid);
  const snap = await userRef.get();
  const userData = snap.exists ? snap.data() : null;
  if (!userData || userData.role !== 'admin') throw new Error('Forbidden: not an admin');
  return { uid: decoded.uid, email: decoded.email };
}

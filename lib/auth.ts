'use client';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';

export async function signupStudent({ name, email, password, phone, country }: { name:string; email:string; password:string; phone?:string; country?:string }){
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const userRef = doc(db, 'users', cred.user.uid);
  const userDoc = {
    name,
    email,
    phone: phone || '',
    country: country || '',
    role: 'student',
    studentId: `MS${Math.floor(1000 + Math.random()*9000)}`,
    enrolledCourses: [],
    createdAt: serverTimestamp()
  };
  await setDoc(userRef, userDoc);
  return { uid: cred.user.uid };
}

export async function loginWithEmail(email:string, password:string){
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout(){
  return signOut(auth);
}

export async function getUserDoc(uid:string){
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export async function uploadPaymentScreenshot(userId:string, file: File, metadata: { courseId: string; amount:number; currency?:string }){
  const storageRef = ref(storage, `user_uploads/${userId}/payments/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snap.ref);

  const paymentRef = doc(db, 'payments', `${userId}_${Date.now()}`);
  await setDoc(paymentRef, {
    userId,
    courseId: metadata.courseId,
    amount: metadata.amount,
    currency: metadata.currency || 'PKR',
    method: 'bank_transfer',
    screenshotUrl: url,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return { paymentId: paymentRef.id };
}

export async function approvePayment(paymentId:string, adminId:string){
  const paymentRef = doc(db, 'payments', paymentId);
  const paymentSnap = await getDoc(paymentRef);
  if(!paymentSnap.exists()) throw new Error('Payment not found');
  const payment = paymentSnap.data() as any;

  // mark approved
  await updateDoc(paymentRef, { status: 'approved', approvedAt: serverTimestamp(), approvedBy: adminId });

  // add course to user enrolledCourses
  const userRef = doc(db, 'users', payment.userId);
  await updateDoc(userRef, { enrolledCourses: arrayUnion({ courseId: payment.courseId, purchasedAt: serverTimestamp(), progress: 0 }) });
}

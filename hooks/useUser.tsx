'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function useUser(){
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=>{
      if(u){
        const userRef = doc(db, 'users', u.uid);
        const unsubSnap = onSnapshot(userRef, (snap)=>{
          setUser({ uid: u.uid, email: u.email, ...snap.data() });
          setLoading(false);
        }, ()=>{ setLoading(false); });
        return () => unsubSnap();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsub();
  },[]);

  return { user, loading };
}

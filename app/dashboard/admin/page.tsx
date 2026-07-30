'use client';
import React, { useEffect, useState } from 'react';
import AuthGate from '../../../components/AuthGate';
import useUser from '../../../hooks/useUser';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { approvePayment } from '../../../lib/auth';

export default function AdminDashboard(){
  const { user } = useUser();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(()=>{
    async function load(){
      const q = query(collection(db, 'payments'), where('status','==','pending'));
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d=>({ id: d.id, ...d.data() })));
    }
    load();
  },[]);

  async function handleApprove(p:any){
    if(!user) return;
    try{
      await approvePayment(p.id, user.uid);
      setPayments((prev)=>prev.filter(x=>x.id!==p.id));
      alert('Payment approved and course unlocked for student');
    }catch(err:any){ alert(err.message || 'Approve failed'); }
  }

  return (
    <AuthGate role="admin">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-display">Admin Dashboard</h1>
        <section className="mt-8">
          <h2 className="font-medium mb-4">Pending Payments</h2>
          {payments.length===0 && <div className="text-sm text-muted">No pending payments</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {payments.map(p=> (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.courseId}</div>
                    <div className="text-sm text-muted">{p.amount} {p.currency}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>handleApprove(p)} className="btn-primary">Approve</button>
                    <button className="btn-ghost">Reject</button>
                  </div>
                </div>
                <div className="mt-3">
                  <img src={p.screenshotUrl} alt="screenshot" className="w-full h-40 object-contain rounded-md"/>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuthGate>
  );
}

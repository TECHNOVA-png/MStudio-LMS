'use client';
import React, { useEffect, useState } from 'react';
import useUser from '../../../../hooks/useUser';

export default function AdminPayments(){
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);

  async function authFetch(path:string, opts:any={}){
    const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
    opts.headers = { ...(opts.headers||{}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    return fetch(path, opts);
  }

  async function load(){
    setLoading(true);
    try{
      const res = await authFetch('/api/admin/list-payments');
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      setPayments(json.payments || []);
    }catch(e:any){ alert(e.message||'Error'); }
    setLoading(false);
  }

  async function approve(id:string){
    if(!confirm('Approve payment and enroll user?')) return;
    try{
      const res = await authFetch('/api/admin/approve-payment', { method: 'POST', body: JSON.stringify({ paymentId: id }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      load();
      alert('Approved');
    }catch(e:any){ alert(e.message||'Error'); }
  }

  if(loading) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-2xl mb-4">Pending Payments</h2>
      <div className="space-y-3">
        {payments.map(p=> (
          <div key={p.id} className="bg-white p-3 rounded border flex items-center justify-between">
            <div>
              <div className="font-medium">{p.userEmail || p.userId} • {p.amount} {p.currency}</div>
              <div className="text-sm text-muted">Course: {p.courseId} • Status: {p.status}</div>
            </div>
            <div className="flex gap-2">
              {p.status !== 'approved' && <button className="btn-primary" onClick={()=>approve(p.id)}>Approve</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { uploadPaymentScreenshot } from '../lib/auth';
import useUser from '../hooks/useUser';

export default function PaymentUploader({ courseId, amount }: { courseId:string; amount:number }){
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e:any){
    e.preventDefault();
    if(!user){ alert('Please login'); return; }
    if(!file){ alert('Please upload screenshot'); return; }
    setLoading(true);
    try{
      await uploadPaymentScreenshot(user.uid, file, { courseId, amount, currency: 'PKR' });
      alert('Payment uploaded. Awaiting admin approval.');
    }catch(err:any){ alert(err.message || 'Upload failed'); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <div className="flex gap-2">
        <button disabled={loading} className="btn-primary">Upload Payment</button>
      </div>
    </form>
  );
}

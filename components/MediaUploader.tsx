'use client';
import React, { useState } from 'react';

export default function MediaUploader({ courseId, onUploaded }: { courseId: string; onUploaded?: (url: string)=>void }){
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e:any){
    e.preventDefault();
    if(!file) return alert('Please select a file');
    setLoading(true);
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      if(!token) throw new Error('Please login as admin');
      const res = await fetch('/api/admin/upload-url', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', courseId }) });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Upload URL failed');
      const uploadUrl = json.uploadUrl;
      const path = json.path;

      // PUT file to signed URL
      const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if(!(put.ok || put.status===200 || put.status===201)) throw new Error('Upload failed');

      // Construct public URL for Firebase Storage (alt=media)
      const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;

      if(onUploaded) onUploaded(fileUrl);
      alert('Uploaded successfully');
    }catch(err:any){ alert(err.message || 'Upload failed'); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <input type="file" accept="image/*,video/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <div className="flex gap-2">
        <button className="btn-primary" disabled={loading}>Upload</button>
      </div>
    </form>
  );
}

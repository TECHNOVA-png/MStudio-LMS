'use client';
import React, { useState } from 'react';

export default function MediaUploader({ courseId, onUploaded }: { courseId: string; onUploaded?: (url: string)=>void }){
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressPct, setProgressPct] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function toDataUrl(file: File){
    return new Promise<string>((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = ()=> resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(e:any){
    e.preventDefault();
    if(!file) return alert('Please select a file');
    setLoading(true);
    setProgressPct(0);
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      if(!token) throw new Error('Please login as admin');
      const res = await fetch('/api/admin/upload-url', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', courseId }) });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Upload URL failed');
      const uploadUrl = json.uploadUrl;
      const path = json.path;

      // PUT file to signed URL with progress using XHR
      await new Promise<void>((resolve,reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (evt)=>{
          if(evt.lengthComputable) setProgressPct(Math.round((evt.loaded/evt.total)*100));
        };
        xhr.onload = ()=>{ if(xhr.status===200 || xhr.status===201) resolve(); else reject(new Error('Upload failed ' + xhr.status)); };
        xhr.onerror = ()=> reject(new Error('Network error'));
        xhr.send(file);
      });

      // Construct public URL for Firebase Storage (alt=media)
      const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;

      if(onUploaded) onUploaded(fileUrl);
      alert('Uploaded successfully');
    }catch(err:any){ alert(err.message || 'Upload failed'); }
    setLoading(false);
    setProgressPct(null);
  }

  async function handleFileChange(e:any){
    const f = e.target.files?.[0] || null;
    setFile(f);
    if(f && f.type.startsWith('image/')){
      const d = await toDataUrl(f);
      setPreview(d);
    } else {
      setPreview(null);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      {preview && <img src={preview} className="w-full h-32 object-cover rounded-md" alt="preview" />}
      <input type="file" accept="image/*,video/*,application/pdf" onChange={handleFileChange} />
      {progressPct !== null && <div className="text-sm">Uploading: {progressPct}%</div>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </div>
    </form>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminMediaLibrary(){
  const search = useSearchParams();
  const courseId = search.get('courseId') || '';
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ if(courseId) load(); else setLoading(false); },[courseId]);

  async function authFetch(path:string, opts:any={}){
    const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
    opts.headers = { ...(opts.headers||{}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    return fetch(path, opts);
  }

  async function load(){
    setLoading(true);
    try{
      const res = await authFetch(`/api/admin/list-media?courseId=${encodeURIComponent(courseId)}`);
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      setFiles(json.files||[]);
    }catch(e:any){ alert(e.message||'Error'); }
    setLoading(false);
  }

  async function deleteFile(path:string){
    if(!confirm('Delete file?')) return;
    try{
      const res = await authFetch(`/api/admin/delete-media`, { method: 'POST', body: JSON.stringify({ path }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      load();
    }catch(e:any){ alert(e.message||'Error'); }
  }

  if(!courseId) return <div className="container mx-auto px-6 py-12">Please provide ?courseId=COURSE_ID in the URL</div>;
  if(loading) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-2xl mb-4">Media Library for {courseId}</h2>
      <div className="space-y-3">
        {files.map(f=> (
          <div key={f.path} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{f.name}</div>
              <div className="text-sm text-muted">{f.size ? f.size + ' bytes' : '—'}</div>
            </div>
            <div className="flex gap-2">
              <a className="btn-ghost" href={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(f.path)}?alt=media`} target="_blank" rel="noreferrer">Open</a>
              <button className="btn-ghost" onClick={()=>deleteFile(f.path)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

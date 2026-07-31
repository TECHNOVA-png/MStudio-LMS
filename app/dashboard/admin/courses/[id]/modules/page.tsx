'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AdminModulesPage(){
  const params = useParams();
  const { id } = params as { id: string };
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLesson, setNewLesson] = useState({ moduleId: '', title: '', type: 'theory' });

  useEffect(()=>{ load(); },[id]);

  async function authFetch(path: string, opts: any = {}){
    const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
    opts.headers = { ...(opts.headers||{}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const res = await fetch(path, opts);
    return res;
  }

  async function load(){
    setLoading(true);
    const res = await fetch('/api/public/courses');
    const json = await res.json();
    const course = (json.courses||[]).find((c:any)=> c.id === id);
    setModules(course?.modules || []);
    setLoading(false);
  }

  async function createModule(){
    if(!newModuleTitle.trim()) return alert('Enter a title');
    try{
      const res = await authFetch('/api/admin/create-module', { method: 'POST', body: JSON.stringify({ courseId: id, title: newModuleTitle }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      setNewModuleTitle(''); load();
    }catch(e:any){ alert(e.message||'Error'); }
  }

  async function deleteModule(moduleId:string){
    if(!confirm('Delete module?')) return;
    try{
      const res = await authFetch('/api/admin/delete-module', { method: 'POST', body: JSON.stringify({ courseId: id, moduleId }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      load();
    }catch(e:any){ alert(e.message||'Error'); }
  }

  async function addLesson(modId:string){
    const title = prompt('Lesson title');
    if(!title) return;
    const type = prompt('Lesson type (theory/video/pdf)', 'theory') || 'theory';
    try{
      const res = await authFetch('/api/admin/create-lesson', { method: 'POST', body: JSON.stringify({ courseId: id, moduleId: modId, title, type }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      load();
    }catch(e:any){ alert(e.message||'Error'); }
  }

  async function deleteLesson(modId:string, lessonId:string){
    if(!confirm('Delete lesson?')) return;
    try{
      const res = await authFetch('/api/admin/delete-lesson', { method: 'POST', body: JSON.stringify({ courseId: id, moduleId: modId, lessonId }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      load();
    }catch(e:any){ alert(e.message||'Error'); }
  }

  async function moveLesson(modId:string, lessonId:string, direction:'up'|'down'){
    try{
      const res = await authFetch('/api/admin/move-lesson', { method: 'POST', body: JSON.stringify({ courseId: id, moduleId: modId, lessonId, direction }) });
      const json = await res.json(); if(!res.ok) throw new Error(json.error||'Failed');
      load();
    }catch(e:any){ alert(e.message||'Error'); }
  }

  if(loading) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h2 className="text-2xl mb-4">Module & Lesson Manager</h2>
      <div className="mb-4 flex gap-2">
        <input value={newModuleTitle} onChange={e=>setNewModuleTitle(e.target.value)} placeholder="New module title" className="p-2 border rounded w-1/2" />
        <button onClick={createModule} className="btn-primary">Create Module</button>
      </div>

      <div className="space-y-4">
        {modules.map(m => (
          <div key={m.id} className="bg-white p-4 rounded-md shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{m.title}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>addLesson(m.id)} className="btn-ghost">Add Lesson</button>
                <button onClick={()=>deleteModule(m.id)} className="btn-ghost">Delete Module</button>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {(m.lessons||[]).map((l:any, idx:number)=> (
                <li key={l.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{l.title}</div>
                    <div className="text-xs text-muted">{l.type} • {l.duration || '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>moveLesson(m.id, l.id, 'up')} className="btn-ghost" disabled={idx===0}>Up</button>
                    <button onClick={()=>moveLesson(m.id, l.id, 'down')} className="btn-ghost" disabled={idx===(m.lessons.length-1)}>Down</button>
                    <button onClick={()=>deleteLesson(m.id, l.id)} className="btn-ghost">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

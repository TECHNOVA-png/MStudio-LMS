'use client';
import React, { useEffect, useState } from 'react';

export default function AdminCoursesList(){
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      // try admin endpoint first
      try{
        const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
        const res = await fetch('/api/admin/list-courses', { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok){
          const json = await res.json();
          setCourses(json.courses || []);
          setLoading(false);
          return;
        }
      }catch(e){ /* fallback to public */ }

      // fallback: public courses
      const res2 = await fetch('/api/public/courses');
      const json2 = await res2.json();
      setCourses(json2.courses || []);
      setLoading(false);
    }
    load();
  },[]);

  async function handleDelete(id:string){
    if(!confirm('Delete course?')) return;
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      const res = await fetch('/api/admin/delete-course', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Delete failed');
      setCourses(prev=>prev.filter(c=>c.id!==id));
      alert('Deleted');
    }catch(err:any){ alert(err.message || 'Delete failed'); }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display">Courses</h1>
        <a href="/dashboard/admin/courses/create" className="btn-primary">Create Course</a>
      </div>

      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(c=> (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-soft">
            <img src={c.imageUrl || '/hero-course.jpg'} className="w-full h-36 object-cover rounded-md" />
            <h3 className="mt-3 font-medium">{c.title}</h3>
            <p className="text-sm text-muted">{c.shortDescription}</p>
            <div className="mt-3 flex gap-2">
              <a className="btn-ghost" href={`/dashboard/admin/courses/${c.id}`}>Edit</a>
              <button onClick={()=>handleDelete(c.id)} className="btn-ghost">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

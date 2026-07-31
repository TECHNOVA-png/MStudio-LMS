'use client';
import React, { useEffect, useState } from 'react';
import useUser from '../hooks/useUser';

export default function CoursePlayer({ course }: { course: any }){
  const { user } = useUser();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(()=>{
    async function loadProgress(){
      if(!user) return;
      try{
        const res = await fetch(`/api/public/course-progress?userId=${user.uid}&courseId=${course.id}`);
        const json = await res.json();
        if(res.ok){
          setCompleted(json.lessonsCompleted || []);
        }
      }catch(e){/* ignore */}
    }
    loadProgress();
  },[user, course?.id]);

  async function markComplete(lessonId:string){
    if(!user) return alert('Please login');
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      const res = await fetch('/api/student/complete-lesson', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId: course.id, lessonId }) });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Failed');
      setCompleted(prev => Array.from(new Set([...prev, lessonId])));
    }catch(err:any){ alert(err.message || 'Failed to mark complete'); }
  }

  const totalLessons = course.modules?.reduce((acc:any, m:any)=> acc + (m.lessons?.length||0), 0) || 0;
  const done = completed.length;
  const progress = totalLessons ? Math.round((done/totalLessons)*100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-soft">
        <h2 className="text-xl font-medium">{course.title}</h2>
        <p className="text-sm text-muted mt-2">Progress: {progress}% ({done}/{totalLessons})</p>
      </div>

      {course.modules?.map((m:any)=> (
        <div key={m.id} className="bg-white p-4 rounded-2xl shadow-soft">
          <h3 className="font-medium">{m.title}</h3>
          <ul className="mt-3 space-y-2">
            {m.lessons?.map((l:any)=> (
              <li key={l.id} className="flex items-center justify-between">
                <div>
                  <div className={`${completed.includes(l.id) ? 'text-muted' : ''}`}>{l.title}</div>
                  <div className="text-sm text-muted">{l.type} • {l.duration ? l.duration + 'm' : '—'}</div>
                </div>
                <div>
                  {completed.includes(l.id) ? (
                    <button className="btn-ghost" disabled>Completed</button>
                  ) : (
                    <button className="btn-primary" onClick={()=>markComplete(l.id)}>Mark complete</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

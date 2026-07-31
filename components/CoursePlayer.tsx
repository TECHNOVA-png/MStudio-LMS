'use client';
import React, { useEffect, useState } from 'react';
import useUser from '../hooks/useUser';

export default function CoursePlayer({ course }: { course: any }){
  const { user } = useUser();
  const [progress, setProgress] = useState<{ lessonsCompleted: string[]; lastLesson?: string }>({ lessonsCompleted: [], lastLesson: undefined });
  const [current, setCurrent] = useState<any | null>(null);

  useEffect(()=>{
    async function loadProgress(){
      if(!user || !course) return;
      try{
        const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
        const res = await fetch(`/api/public/course-progress?courseId=${course.id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if(res.ok){
          setProgress({ lessonsCompleted: json.lessonsCompleted || [], lastLesson: json.lastLesson });
          // set current to lastLesson or first lesson
          const first = findFirstLesson(course);
          const lastId = json.lastLesson || (first && first.id);
          const lastLesson = findLessonById(course, lastId);
          setCurrent(lastLesson || first || null);
        }
      }catch(e){/* ignore */}
    }
    loadProgress();
  },[user, course?.id]);

  function findAllLessons(courseObj:any){
    const lessons:any[] = [];
    (courseObj.modules||[]).forEach((m:any)=>{ (m.lessons||[]).forEach((l:any)=> lessons.push({ ...l, moduleId: m.id, moduleTitle: m.title })); });
    return lessons;
  }
  function findLessonById(courseObj:any, id?:string){
    if(!id) return null;
    return findAllLessons(courseObj).find(l=>l.id===id) || null;
  }
  function findFirstLesson(courseObj:any){
    const lessons = findAllLessons(courseObj);
    return lessons.length ? lessons[0] : null;
  }

  async function markComplete(lessonId:string){
    if(!user) return alert('Please login');
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      const res = await fetch('/api/student/complete-lesson', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId: course.id, lessonId }) });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Failed');
      // update local progress
      setProgress(prev=> ({ ...prev, lessonsCompleted: Array.from(new Set([...prev.lessonsCompleted, lessonId])) }));
    }catch(err:any){ alert(err.message || 'Failed to mark complete'); }
  }

  async function saveLastLesson(lessonId:string){
    if(!user) return;
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      await fetch('/api/student/last-lesson', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId: course.id, lessonId }) });
    }catch(e){ console.warn('last-lesson save failed', e); }
  }

  function nextLesson(){
    const lessons = findAllLessons(course);
    if(!current) return;
    const idx = lessons.findIndex((l:any)=>l.id===current.id);
    if(idx>=0 && idx < lessons.length-1){
      const next = lessons[idx+1];
      setCurrent(next);
      saveLastLesson(next.id);
    }
  }
  function prevLesson(){
    const lessons = findAllLessons(course);
    if(!current) return;
    const idx = lessons.findIndex((l:any)=>l.id===current.id);
    if(idx>0){
      const prev = lessons[idx-1];
      setCurrent(prev);
      saveLastLesson(prev.id);
    }
  }

  if(!course) return null;

  const lessonsFlat = findAllLessons(course);
  const totalLessons = lessonsFlat.length;
  const done = progress.lessonsCompleted.length;
  const percent = totalLessons ? Math.round((done/totalLessons)*100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-soft">
        <h2 className="text-xl font-medium">{course.title}</h2>
        <p className="text-sm text-muted mt-2">Progress: {percent}% ({done}/{totalLessons})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-soft">
            {current ? (
              <div>
                <h3 className="text-lg font-medium">{current.title}</h3>
                <div className="mt-3">
                  {current.type === 'video' && current.videoUrl ? (
                    <video key={current.videoUrl} controls className="w-full rounded-md">
                      <source src={current.videoUrl} />
                      Your browser does not support the video tag.
                    </video>
                  ) : current.type === 'pdf' && current.content ? (
                    <iframe src={current.content} className="w-full h-96 border rounded-md" title={current.title}></iframe>
                  ) : (
                    <div className="prose max-w-none text-sm mt-2"><p>{current.content}</p></div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    {progress.lessonsCompleted.includes(current.id) ? (
                      <button className="btn-ghost" disabled>Completed</button>
                    ) : (
                      <button className="btn-primary" onClick={()=>markComplete(current.id)}>Mark complete</button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <button className="btn-ghost" onClick={prevLesson} disabled={lessonsFlat.findIndex(l=>l.id===current.id)===0}>Prev</button>
                      <button className="btn-primary" onClick={nextLesson}>Next</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>Select a lesson to begin</div>
            )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-soft">
            <h4 className="font-medium mb-2">Course outline</h4>
            <div className="space-y-3">
              {course.modules?.map((m:any)=> (
                <div key={m.id}>
                  <div className="text-sm font-medium">{m.title}</div>
                  <ul className="mt-2 space-y-2">
                    {m.lessons?.map((l:any)=> (
                      <li key={l.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${progress.lessonsCompleted.includes(l.id) ? 'opacity-70' : ''}`} onClick={()=>{ setCurrent(l); saveLastLesson(l.id); }}>
                        <div>
                          <div className="font-medium">{l.title}</div>
                          <div className="text-xs text-muted">{l.type} • {l.duration ? l.duration + 'm' : '—'}</div>
                        </div>
                        <div>
                          {progress.lessonsCompleted.includes(l.id) ? <span className="text-sm text-muted">Done</span> : <span className="text-sm">&nbsp;</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-white p-4 rounded-2xl shadow-soft">
          <div className="text-sm text-muted">Course details</div>
          <div className="mt-2">
            <div><strong>Duration:</strong> {course.duration || '—'}</div>
            <div className="mt-1"><strong>Lessons:</strong> {totalLessons}</div>
            <div className="mt-1"><strong>Completed:</strong> {done}</div>
          </div>
          <div className="mt-4">
            <button className="btn-ghost" onClick={()=>{ if(current) saveLastLesson(current.id); alert('Progress saved'); }}>Save position</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

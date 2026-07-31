'use client';
import React, { useEffect, useState } from 'react';
import useUser from '../../../hooks/useUser';

export default function ContinueLearning(){
  const { user } = useUser();
  const [entry, setEntry] = useState<any>(null);

  useEffect(()=>{
    async function load(){
      if(!user) return;
      const res = await fetch('/api/public/courses');
      const json = await res.json();
      const all = json.courses || [];
      const enrolled = (user.enrolledCourses || []).map((e:any)=> ({ ...e, course: all.find((c:any)=> c.id === e.courseId) }));
      const first = enrolled.find((e:any)=> e.course);
      if(!first) return;
      // fetch progress
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      const p = await fetch(`/api/public/course-progress?courseId=${first.courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      const pj = await p.json();
      setEntry({ course: first.course, lastLesson: pj.lastLesson });
    }
    load();
  },[user]);

  if(!entry) return null;
  const slug = entry.course.slug;
  const url = `/courses/${slug}` + (entry.lastLesson ? `?lesson=${entry.lastLesson}` : '');

  return (
    <div className="bg-white p-4 rounded-2xl shadow-soft">
      <h3 className="text-lg font-medium">Continue Learning</h3>
      <div className="mt-2">Resume <strong>{entry.course.title}</strong></div>
      <div className="mt-3">
        <a className="btn-primary" href={url}>Continue</a>
      </div>
    </div>
  );
}

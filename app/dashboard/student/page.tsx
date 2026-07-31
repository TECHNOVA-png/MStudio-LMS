'use client';
import React, { useEffect, useState } from 'react';
import AuthGate from '../../../components/AuthGate';
import useUser from '../../../hooks/useUser';
import CourseCard from '../../../components/CourseCard';

export default function StudentDashboard(){
  const { user } = useUser();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(()=>{
    async function loadAll(){
      const res = await fetch('/api/public/courses');
      const json = await res.json();
      const all = json.courses || [];
      // Map enrolled courses with details
      const enrolled = (user?.enrolledCourses || []).map((e:any)=> {
        const c = all.find((x:any)=> x.id === e.courseId);
        return c ? { ...c, purchasedAt: e.purchasedAt, progress: e.progress } : { courseId: e.courseId };
      });
      setCourses(enrolled);
    }
    if(user) loadAll();
  },[user]);

  return (
    <AuthGate role="student">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display">Student Dashboard</h1>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-medium mb-4">My Courses</h2>
          {courses.length===0 && <div className="text-sm text-muted">You have not enrolled in any courses yet.</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c:any)=> (
              <div key={c.id || c.courseId}>
                <CourseCard course={{ ...c, image: c.imageUrl || '/hero-course.jpg' }} />
                <div className="mt-3 flex gap-2">
                  {c.id ? <a className="btn-primary" href={`/dashboard/student/course/${c.id}`}>Open Course</a> : <span className="text-sm text-muted">Course not available</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuthGate>
  );
}

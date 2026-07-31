'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useUser from '../../hooks/useUser';
import CoursePlayer from '../../components/CoursePlayer';

export default function CoursePage(){
  const params = useParams();
  const { slug } = params as { slug: string };
  const { user, loading } = useUser();
  const [course, setCourse] = useState<any|null>(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(()=>{
    async function load(){
      const res = await fetch(`/api/public/course-by-slug?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      setCourse(json.course);
    }
    load();
  },[slug]);

  useEffect(()=>{
    if(!course || !user) { setEnrolled(false); return; }
    const isEnrolled = (user.enrolledCourses || []).some((c:any)=> c.courseId === course.id);
    setEnrolled(isEnrolled);
  },[course, user]);

  if(!course) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-display">{course.title}</h1>
          <p className="text-muted mt-2">{course.shortDescription}</p>

          {enrolled ? (
            <div className="mt-6">
              <CoursePlayer course={course} />
            </div>
          ) : (
            <div className="mt-6 bg-white p-6 rounded-2xl shadow-soft">
              <p className="mb-4">This course is locked. Enroll to start learning.</p>
              <a href="#" className="btn-primary">Enroll</a>
            </div>
          )}
        </div>

        <aside className="bg-white p-6 rounded-2xl shadow-soft">
          <img src={course.imageUrl || '/hero-course.jpg'} className="w-full h-40 object-cover rounded-md" />
          <div className="mt-4">
            <div className="text-lg font-medium">Price: {course.currency || 'PKR'} {course.price}</div>
            <div className="text-sm text-muted mt-2">Duration: {course.duration || '—'}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

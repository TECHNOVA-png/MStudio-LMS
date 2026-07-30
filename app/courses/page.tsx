'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CourseCard from '../../components/CourseCard';
import PaymentUploader from '../../components/PaymentUploader';

export default function CoursesPage(){
  const [courses, setCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);

  useEffect(()=>{
    async function load(){
      const q = query(collection(db, 'courses'));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d=>({ id: d.id, ...d.data() })));
    }
    load();
  },[]);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-display mb-6">All Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(c=> (
          <div key={c.id}>
            <CourseCard course={{ ...c, image: c.imageUrl || '/hero-course.jpg' }} />
            <div className="mt-3 flex gap-2">
              <button onClick={()=>setSelected(c)} className="btn-primary">Enroll</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
            <h3 className="text-xl font-medium">Enroll in {selected.title}</h3>
            <p className="text-sm text-muted">Please upload your JazzCash / bank transfer screenshot. Admin will review and approve.</p>
            <div className="mt-4">
              <PaymentUploader courseId={selected.id} amount={selected.price || 0} />
            </div>
            <div className="mt-4 text-right">
              <button onClick={()=>setSelected(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

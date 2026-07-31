'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function CourseCard({ course }: { course: any }){
  const hasTheory = course?.modules && course.modules.some((m:any) => m.lessons && m.lessons.some((l:any) => l.type === 'theory'));
  const aiImage = course.imageUrl || '/hero-course.jpg';

  return (
    <motion.article whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl p-4 shadow-soft border border-transparent hover:border-red-50 transition">
      <div className="relative rounded-xl overflow-hidden h-44">
        <img src={aiImage} alt={course.title} className="object-cover w-full h-full" />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium">{course.title}</h3>
        <p className="text-sm text-muted mt-1">{course.shortDescription || course.description}</p>
        <div className="mt-3 flex items-center gap-3">
          {hasTheory && <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">Theory</span>}
          <span className="text-sm text-muted">Duration: {course.duration || '—'}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted">Duration: 8h</div>
          <div className="text-primary font-semibold">PKR {course.price}</div>
        </div>
      </div>
    </motion.article>
  );
}

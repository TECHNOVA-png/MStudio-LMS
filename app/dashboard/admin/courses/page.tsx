'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';

const CourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  shortDescription: z.string().optional(),
  description: z.string().min(10),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
  duration: z.string().optional()
});

export default function AdminCreateCourse(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(CourseSchema) });

  async function onSubmit(values:any){
    try{
      const auth = getAuth();
      const user = auth.currentUser;
      if(!user) return alert('Please login as admin');
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values)
      });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Failed');
      alert('Course created: ' + json.id);
    }catch(err:any){
      alert(err.message || 'Create failed');
    }
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <h2 className="text-2xl font-display mb-4">Create Course</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('title')} placeholder="Course title" className="w-full p-3 rounded-lg border" />
        {errors.title && <p className="text-red-500 text-sm">{(errors.title as any).message}</p>}
        <input {...register('slug')} placeholder="slug (unique)" className="w-full p-3 rounded-lg border" />
        <input {...register('shortDescription')} placeholder="Short description" className="w-full p-3 rounded-lg border" />
        <textarea {...register('description')} placeholder="Full description" className="w-full p-3 rounded-lg border h-40" />
        <input type="number" step="1" {...register('price', { valueAsNumber: true })} placeholder="Price (PKR)" className="w-full p-3 rounded-lg border" />
        <input {...register('imageUrl')} placeholder="Image URL" className="w-full p-3 rounded-lg border" />
        <input {...register('duration')} placeholder="Duration (e.g., 8h)" className="w-full p-3 rounded-lg border" />
        <div className="flex gap-2">
          <button disabled={isSubmitting} className="btn-primary">Create</button>
        </div>
      </form>
    </div>
  );
}

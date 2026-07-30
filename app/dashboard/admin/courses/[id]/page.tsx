'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const CourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  shortDescription: z.string().optional(),
  description: z.string().min(10),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
  duration: z.string().optional()
});

export default function AdminEditCourse(){
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(CourseSchema) });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      const res = await fetch('/api/public/courses');
      const json = await res.json();
      const course = json.courses.find((c:any)=>c.id===id);
      if(course) reset(course);
      setLoading(false);
    }
    load();
  },[id]);

  async function onSubmit(values:any){
    try{
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      if(!token) return alert('Please login as admin');
      const body = { id, ...values };
      const res = await fetch('/api/admin/update-course', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Failed');
      alert('Course updated');
      router.push('/dashboard/admin/courses');
    }catch(err:any){ alert(err.message || 'Update failed'); }
  }

  if(loading) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <h2 className="text-2xl font-display mb-4">Edit Course</h2>
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
          <button disabled={isSubmitting} className="btn-primary">Save</button>
          <button type="button" onClick={()=>router.push('/dashboard/admin/courses')} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}

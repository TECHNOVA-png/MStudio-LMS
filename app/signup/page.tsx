'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signupStudent } from '../../lib/auth';
import { useRouter } from 'next/navigation';

const SignupSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), country: z.string().min(2), password: z.string().min(6), confirmPassword: z.string().min(6) }).refine((d:any)=>d.password===d.confirmPassword,{ message: 'Passwords must match', path: ['confirmPassword'] });

export default function Signup(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(SignupSchema) });
  const router = useRouter();

  async function onSubmit(values:any){
    try{
      await signupStudent({ name: values.name, email: values.email, password: values.password, phone: values.phone, country: values.country });
      router.push('/dashboard/student');
    }catch(err:any){
      alert(err.message || 'Signup failed');
    }
  }

  return (
    <div className="container mx-auto px-6 py-24 max-w-lg">
      <h1 className="text-3xl font-display mb-6">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Full name" className="w-full p-3 rounded-lg border" />
        {errors.name && <p className="text-red-500 text-sm">{(errors.name as any).message}</p>}
        <input {...register('email')} placeholder="Email" className="w-full p-3 rounded-lg border" />
        <input {...register('phone')} placeholder="Phone" className="w-full p-3 rounded-lg border" />
        <input {...register('country')} placeholder="Country" className="w-full p-3 rounded-lg border" />
        <input type="password" {...register('password')} placeholder="Password" className="w-full p-3 rounded-lg border" />
        <input type="password" {...register('confirmPassword')} placeholder="Confirm Password" className="w-full p-3 rounded-lg border" />
        <button disabled={isSubmitting} className="btn-primary w-full">Create account</button>
      </form>
    </div>
  );
}

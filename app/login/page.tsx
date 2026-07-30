'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginWithEmail } from '../../lib/auth';
import { useRouter } from 'next/navigation';

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function LoginPage(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(LoginSchema) });
  const router = useRouter();

  async function onSubmit(values:any){
    try{
      await loginWithEmail(values.email, values.password);
      router.push('/dashboard/student');
    }catch(err:any){
      alert(err.message || 'Login failed');
    }
  }

  return (
    <div className="container mx-auto px-6 py-24 max-w-md">
      <h1 className="text-3xl font-display mb-6">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} placeholder="Email or Student ID" className="w-full p-3 rounded-lg border" />
        {errors.email && <p className="text-red-500 text-sm">{(errors.email as any).message}</p>}
        <input type="password" {...register('password')} placeholder="Password" className="w-full p-3 rounded-lg border" />
        {errors.password && <p className="text-red-500 text-sm">{(errors.password as any).message}</p>}
        <button disabled={isSubmitting} className="btn-primary w-full">Sign In</button>
      </form>
    </div>
  );
}

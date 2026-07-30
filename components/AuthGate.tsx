'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import useUser from '../hooks/useUser';

export default function AuthGate({ children, role }: { children: React.ReactNode; role?: 'admin'|'student' }){
  const { user, loading } = useUser();
  const router = useRouter();

  React.useEffect(()=>{
    if(!loading){
      if(!user){
        router.push('/login');
      } else if(role && user.role !== role){
        // redirect to proper dashboard
        router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student');
      }
    }
  },[user,loading]);

  if(loading || !user) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  return <>{children}</>;
}

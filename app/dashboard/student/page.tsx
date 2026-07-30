'use client';
import React from 'react';
import AuthGate from '../../../components/AuthGate';
import useUser from '../../../hooks/useUser';
import { logout } from '../../../lib/auth';

export default function StudentDashboard(){
  const { user } = useUser();

  return (
    <AuthGate role="student">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display">Student Dashboard</h1>
          <div>
            <button onClick={() => logout()} className="btn-ghost">Logout</button>
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-medium">Continue Learning</h3>
            <p className="text-sm text-muted mt-2">Resume your last course and see progress.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-medium">Certificates</h3>
            <p className="text-sm text-muted mt-2">Your earned certificates will appear here.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-medium">Payments</h3>
            <p className="text-sm text-muted mt-2">View payment status and receipts.</p>
          </div>
        </section>
      </div>
    </AuthGate>
  );
}

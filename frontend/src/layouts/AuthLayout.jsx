import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CareerLogo } from '../components/CareerLogo';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <CareerLogo linkTo="/" />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      <main className="my-auto py-8">
        <Outlet />
      </main>

      <footer className="max-w-md w-full mx-auto text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CareerAI. Built for students and ambitious graduates.
      </footer>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { CareerLogo } from '../components/CareerLogo';
import { useAuth } from '../hooks/useAuth';
import {
  FileUp,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Target,
  FileCheck,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      num: '01',
      title: 'Upload Resume',
      desc: 'Import your existing resume or draft. We analyze your qualifications across engineering, business, sciences, or arts.',
      icon: FileUp,
    },
    {
      num: '02',
      title: 'Find Jobs',
      desc: 'Search genuine entry-level roles, fresher openings, and internships matched to your education and career goals.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Apply & Track',
      desc: 'Tailor your application for each specific job description and track application progress from submitted to hired.',
      icon: CheckCircle2,
    },
    {
      num: '04',
      title: 'Prepare for Interviews',
      desc: 'Practice tailored technical and behavioral questions aligned directly to the role you applied for.',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <CareerLogo linkTo="/" />

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-100"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED CAREER PLATFORM FOR STUDENTS &amp; GRADUATES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            Find Jobs. Build the Right Resume.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              Get Interview Ready.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            CareerAI helps students discover opportunities, create job-specific resumes, track applications, and prepare for interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white text-base font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white text-slate-700 text-base font-semibold border border-slate-200/90 hover:bg-slate-50 transition shadow-xs"
            >
              Explore Jobs
            </Link>
          </div>

          {/* Student Trust Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Tailored for Any Degree</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Targeted Job Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Real ATS Optimization</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              How It Works
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A structured path from student to hired professional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-200 hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-400 tracking-wider">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student First Promise */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Built for College Students &amp; Fresh Graduates
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
                Whether you are pursuing B.Tech, BCA, B.Sc, B.Com, BBA, Nursing, Law or other disciplines, CareerAI provides the foundation to accelerate your job search.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition shadow-sm"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <CareerLogo size="sm" linkTo="/" />
          <p>&copy; {new Date().getFullYear()} CareerAI. All rights reserved. Clean foundation for future career tools.</p>
        </div>
      </footer>
    </div>
  );
};

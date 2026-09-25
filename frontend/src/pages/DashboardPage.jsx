import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Briefcase,
  ClipboardList,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Upload,
  Clock,
  Compass,
  FileCheck,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';
import { applicationService } from '../services/applicationService';
import { getAcademicStageFromYear } from '../utils/constants';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [matchedJobsCount, setMatchedJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [hasResume, setHasResume] = useState(false);
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const resumeRes = await resumeService.getMyResume();
      if (resumeRes.success && resumeRes.data) {
        setHasResume(true);
        setResumeName(resumeRes.data.fileName);
        const matchRes = await jobService.getMatchedJobs();
        if (matchRes.success) {
          setMatchedJobsCount(matchRes.data?.length || 0);
        }
      }

      const appRes = await applicationService.getApplicationCount();
      if (appRes.success && appRes.data !== undefined) {
        setApplicationsCount(appRes.data);
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
    }
  };

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const studentName = user?.name || 'Student';

  const metrics = [
    {
      label: 'Job Matches',
      value: matchedJobsCount,
      subtext: hasResume ? 'Matched to your skills' : 'Upload resume to match',
      icon: Briefcase,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Applications',
      value: applicationsCount,
      subtext: applicationsCount > 0 ? `${applicationsCount} submitted` : 'No active applications',
      icon: ClipboardList,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Assessments',
      value: 0,
      subtext: 'None pending',
      icon: GraduationCap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Interviews',
      value: 0,
      subtext: 'No upcoming interviews',
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to CareerAI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {getGreeting()}, {studentName}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mb-4">
            {hasResume
              ? `Your resume (${resumeName}) is active. We found ${matchedJobsCount} active openings that fit your profile.`
              : 'Your career journey starts here. Build your foundation, discover tailored opportunities, and prepare for your first job offers.'}
          </p>

          {/* Academic Standing & Separation Callout */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-indigo-50/50 to-white border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {user?.academicYear || (user?.graduationYear ? getAcademicStageFromYear(user.graduationYear) : 'College Student')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Batch {user?.graduationYear || '2027'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your feed is customized for campus hiring & internships. Senior roles (5+ yrs) are separated.
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap self-start sm:self-auto"
            >
              Update Academic Year →
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>{hasResume ? 'View Fresher & Student Matches' : 'Explore Fresher Jobs'}</span>
            </Link>

            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
            >
              <Upload className="w-4 h-4" />
              <span>{hasResume ? 'Update Resume' : 'Upload Resume'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Overview Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500">{card.label}</span>
                  <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                  <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Step Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Recommended Next Step</h3>
        <p className="text-xs text-slate-500 mb-4">
          {hasResume
            ? 'Browse your tailored matches and start applying to internships and entry-level positions.'
            : 'To get personalized job recommendations and skill matching, upload your current resume.'}
        </p>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {hasResume ? <FileCheck className="w-5 h-5" /> : 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {hasResume ? 'Check Your Matched Positions' : 'Add your resume'}
              </p>
              <p className="text-xs text-slate-500">
                {hasResume
                  ? `${matchedJobsCount} active openings match your resume skills`
                  : 'Supports PDF, DOCX, and TXT files'}
              </p>
            </div>
          </div>
          <Link
            to={hasResume ? '/jobs' : '/resume'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            <span>{hasResume ? 'View Matches Now' : 'Go to My Resume'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

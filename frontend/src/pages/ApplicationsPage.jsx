import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { EmptyState } from '../components/EmptyState';

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationService.getUserApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage all your direct job &amp; internship applications submitted via CareerAI.
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs self-start sm:self-auto"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Find More Jobs</span>
        </Link>
      </div>

      {!isLoading && applications.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Applied</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{applications.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Active Stages</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">In Review</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Real Sites Connected</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">100% Verified</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{app.jobTitle}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {app.jobType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {app.workplaceType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {app.status}
                      </span>
                      {app.platform && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                          via {app.platform}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied on {formatDate(app.appliedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <a
                      href={app.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      <span>Application Portal</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="pt-6">
            <EmptyState
              icon={ClipboardList}
              title="You haven't applied to any jobs yet."
              description="Browse your matched active jobs and internships, click Apply to open the real company portal, and your applications will automatically be organized here."
              actionText="Find Matched Jobs"
              actionTo="/jobs"
            />
          </div>
        )
      )}
    </div>
  );
};

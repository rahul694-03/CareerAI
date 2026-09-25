import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Upload,
  RefreshCw,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  X,
  FileText,
  Clock,
  Check,
  Info,
  GraduationCap,
  Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ACADEMIC_YEARS, getAcademicStageFromYear } from '../utils/constants';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';
import { AtsResumeModal } from '../components/AtsResumeModal';

export const JobsPage = () => {
  const { user } = useAuth();

  // State for jobs and pagination
  const [jobs, setJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [providersUnavailable, setProvidersUnavailable] = useState(false);

  // Separation state: 'FRESHER' (default for student platform), 'SENIOR', or 'ALL'
  const [categoryTab, setCategoryTab] = useState('FRESHER');

  // Academic Stage filter: 'ALL', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Fresh Graduate'
  const [academicStageFilter, setAcademicStageFilter] = useState(() => {
    if (user?.academicYear) return user.academicYear;
    if (user?.graduationYear === 2027) return '4th Year';
    if (user?.graduationYear === 2028) return '3rd Year';
    if (user?.graduationYear === 2029) return '2nd Year';
    if (user?.graduationYear && user.graduationYear >= 2030) return '1st Year';
    if (user?.graduationYear && user.graduationYear <= 2026) return 'Fresh Graduate';
    return 'ALL';
  });

  // Resume state
  const [resumeData, setResumeData] = useState(null);
  const [viewMode, setViewMode] = useState('ALL'); // 'ALL' or 'MATCHED'

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState('ALL'); // ALL, INTERNSHIP, FULL_TIME, FRESHER, REMOTE, HYBRID, ON_SITE
  const [locationFilter, setLocationFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selected job for modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showTailorDialog, setShowTailorDialog] = useState(false);
  const [tailoringJob, setTailoringJob] = useState(null);

  // Provider health state
  const [providers, setProviders] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Saved jobs state (persisted locally)
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('careerai_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  // Notice banner
  const [notice, setNotice] = useState(null);

  // Initial resume load
  useEffect(() => {
    loadResumeAndProviders();
  }, []);

  // Fetch jobs on filter/pagination changes
  useEffect(() => {
    if (viewMode === 'ALL') {
      fetchJobsList();
    } else {
      fetchMatchedJobsList();
    }
  }, [currentPage, pageSize, quickFilter, sourceFilter, viewMode, categoryTab, academicStageFilter]);

  const loadResumeAndProviders = async () => {
    try {
      const resumeRes = await resumeService.getMyResume();
      if (resumeRes?.data) {
        setResumeData(resumeRes.data);
        fetchMatchedJobsList();
      }
    } catch (e) {
      console.log('No resume uploaded yet');
    }

    try {
      const provRes = await jobService.getProviderStatus();
      if (provRes?.data) {
        setProviders(provRes.data);
      }
    } catch (e) {
      console.error('Failed to load provider status:', e);
    }
  };

  const fetchJobsList = async () => {
    setIsLoading(true);
    setProvidersUnavailable(false);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        keyword: searchTerm || undefined,
        location: locationFilter || undefined,
        company: companyFilter || undefined,
        source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
      };

      // Category Separation (FRESHER vs SENIOR vs ALL)
      if (categoryTab !== 'ALL') {
        params.category = categoryTab;
      }
      // Academic year matching for students/freshers
      if (categoryTab === 'FRESHER' && academicStageFilter && academicStageFilter !== 'ALL') {
        params.academicYear = academicStageFilter;
      }

      // Map quick filters
      if (quickFilter === 'INTERNSHIP') params.employmentType = 'INTERNSHIP';
      if (quickFilter === 'FULL_TIME') params.employmentType = 'FULL_TIME';
      if (quickFilter === 'FRESHER') params.experienceLevel = 'FRESHER';
      if (quickFilter === 'SENIOR') params.experienceLevel = 'SENIOR';
      if (quickFilter === 'REMOTE') params.remoteType = 'REMOTE';
      if (quickFilter === 'HYBRID') params.remoteType = 'HYBRID';
      if (quickFilter === 'ON_SITE') params.remoteType = 'ON_SITE';

      const res = await jobService.getJobs(params);
      if (res?.data) {
        setJobs(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
        if ((res.data.totalElements || 0) === 0 && !searchTerm && quickFilter === 'ALL' && categoryTab === 'ALL') {
          // If totally empty with no filters applied
          setProvidersUnavailable(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setProvidersUnavailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatchedJobsList = async () => {
    setIsLoading(true);
    try {
      const res = await jobService.getMatchedJobs();
      if (res?.data) {
        setMatchedJobs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch matched jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchJobsList();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCompanyFilter('');
    setQuickFilter('ALL');
    setSourceFilter('ALL');
    setCurrentPage(0);
    setTimeout(() => fetchJobsList(), 50);
  };

  const toggleSaveJob = (jobId) => {
    const updated = savedJobIds.includes(jobId)
      ? savedJobIds.filter((id) => id !== jobId)
      : [...savedJobIds, jobId];
    setSavedJobIds(updated);
    localStorage.setItem('careerai_saved_jobs', JSON.stringify(updated));

    setNotice({
      type: 'info',
      message: savedJobIds.includes(jobId) ? 'Job removed from saved.' : 'Job saved to your list.',
    });
    setTimeout(() => setNotice(null), 3000);
  };

  const triggerManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await jobService.triggerSync();
      setNotice({
        type: 'success',
        message: `Synchronization complete: ${res.data?.totalSaved || 0} real jobs updated.`,
      });
      loadResumeAndProviders();
      fetchJobsList();
    } catch (e) {
      setNotice({ type: 'error', message: 'Sync failed or provider rate limit hit.' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Find match info for a given job if user has resume
  const getJobMatch = (jobId) => {
    if (!resumeData || !matchedJobs.length) return null;
    return matchedJobs.find((m) => m.job?.id === jobId) || null;
  };

  const getSourceBadge = (source, isMultiSource) => {
    if (isMultiSource) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Globe className="w-3 h-3" />
          Multiple Sources
        </span>
      );
    }
    switch (source) {
      case 'OFFICIAL_COMPANY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3 h-3" />
            Official Company
          </span>
        );
      case 'NAUKRI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Naukri
          </span>
        );
      case 'INDEED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Indeed
          </span>
        );
      case 'LINKEDIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            LinkedIn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Verified Feed
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently posted';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently posted';
    }
  };

  const getDirectApplyUrl = (job) => {
    if (!job) return '#';
    let url = job.applyUrl || job.applicationUrl || job.sourceUrl || '';
    if (!url) return '#';

    // Remove any trailing #app so the applicant lands cleanly on the direct ATS requisition overview and [ Apply ] button
    if (url.includes('greenhouse.io') && url.endsWith('#app')) {
      url = url.replace('#app', '');
    }
    // If it's a Lever job posting without /apply, route directly to the apply form
    else if (url.includes('jobs.lever.co') && !url.endsWith('/apply') && !url.includes('/apply?')) {
      url = url.endsWith('/') ? `${url}apply` : `${url}/apply`;
    }

    return url;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Jobs Hiring Now
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              🇮🇳 India Focus
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Real, active opportunities verified directly from Official Company ATS portals (Greenhouse, Lever).
            Direct apply dashboards with zero unnecessary links.
          </p>
        </div>

        {/* Action Header Pills */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {resumeData ? (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Openings ({totalElements})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('MATCHED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'MATCHED'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Resume Matched ({matchedJobs.length})</span>
              </button>
            </div>
          ) : (
            <Link
              to="/resume"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Resume for Match %</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowProviderModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Provider Health</span>
          </button>
        </div>
      </div>

      {/* NOTICE BANNER */}
      {notice && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 border shadow-xs transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice.message}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CATEGORY SEPARATION TABS (Fresher / Senior / All) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Select Career Stream
              </h2>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Separated Feeds
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fresher and student roles are strictly separated from senior executive openings so you only see opportunities tailored for your stage.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setCategoryTab('FRESHER');
                setCurrentPage(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                categoryTab === 'FRESHER'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Freshers & Students</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold">
                Campus / Interns
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryTab('SENIOR');
                setCurrentPage(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                categoryTab === 'SENIOR'
                  ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Seniors (5+ Yrs)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-extrabold">
                Staff / Leads
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryTab('ALL');
                setCurrentPage(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                categoryTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>All Openings</span>
            </button>
          </div>
        </div>

        {/* ACADEMIC YEAR SUB-FILTER (Active only in Fresher / Student Stream) */}
        {categoryTab === 'FRESHER' && (
          <div className="bg-gradient-to-r from-amber-50/70 via-indigo-50/40 to-slate-50 border border-amber-200/60 rounded-2xl p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">
                  Target Academic Standing / Graduation Year:
                </span>
                {user?.academicYear && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                    Your Profile: {user.academicYear} (Class of {user.graduationYear || '2027'})
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Jobs curated by target graduation batch
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAcademicStageFilter('ALL');
                  setCurrentPage(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  academicStageFilter === 'ALL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                All Student Batches
              </button>

              {ACADEMIC_YEARS.map((stage) => {
                const isSelected = academicStageFilter === stage.id;
                const isUserStage = user?.academicYear === stage.id || (user?.graduationYear === stage.gradYear);
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setAcademicStageFilter(stage.id);
                      setCurrentPage(0);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isUserStage
                        ? 'bg-white text-indigo-700 border-2 border-indigo-400 hover:bg-indigo-50'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{stage.label}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                      Batch '{stage.gradYear.toString().slice(-2)}
                    </span>
                    {isUserStage && !isSelected && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded-sm font-black">
                        You
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {categoryTab === 'SENIOR' && (
          <div className="bg-purple-50/60 border border-purple-200/60 rounded-2xl p-3 text-xs text-purple-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Senior Roles Stream:</strong> Showing only Staff, Lead, Principal, and Managerial positions (5+ years experience required). Entry-level & student roles are hidden here.
            </span>
          </div>
        )}

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs, companies or skills (e.g. Java, React, Databricks, Bengaluru)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition shadow-xs"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showAdvancedFilters
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </form>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-400 mr-1">Quick Filters:</span>
          {[
            { id: 'ALL', label: 'All Jobs' },
            { id: 'FRESHER', label: '🎓 Freshers / Grads' },
            { id: 'INTERNSHIP', label: '🌱 Internships' },
            { id: 'SENIOR', label: '⭐ Seniors / Staff' },
            { id: 'FULL_TIME', label: '💼 Full-time' },
            { id: 'REMOTE', label: '🏠 Remote' },
            { id: 'HYBRID', label: '🏢 Hybrid' },
            { id: 'ON_SITE', label: '📍 On-site' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setQuickFilter(pill.id);
                setCurrentPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                quickFilter === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Dropdown Drawer */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location in India</label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. Bengaluru, Hyderabad, Remote"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                placeholder="e.g. Databricks, Speechify, StockX"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Provider Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Sources (ATS, LinkedIn, Indeed, Naukri)</option>
                <option value="OFFICIAL_COMPANY">Official Company ATS (Greenhouse / Lever)</option>
                <option value="LINKEDIN">LinkedIn Direct Apply</option>
                <option value="INDEED">Indeed India Direct</option>
                <option value="NAUKRI">Naukri Direct</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(0);
                  fetchJobsList();
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BANNER FOR STUDENTS WITHOUT RESUME */}
      {!resumeData && (
        <div className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Want to see your Resume Match %?
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Upload your resume to get personalized matching, see which skills you have in green, and spot areas to tailor.
              </p>
            </div>
          </div>
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shrink-0 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume</span>
          </Link>
        </div>
      )}

      {/* JOBS LISTINGS */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Scanning real job providers for active India positions...</p>
          <p className="text-xs text-slate-400">Verifying live ATS listings and deduplicating feeds.</p>
        </div>
      ) : providersUnavailable ? (
        /* Zero Fake Fallback: Show explicit provider unavailable message */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Job providers are temporarily unavailable</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            CareerAI only displays legitimate, verified live job opportunities. External ATS feeds are currently reconnecting. Please check back shortly or trigger a manual sync.
          </p>
          <button
            type="button"
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Retry Provider Sync'}</span>
          </button>
        </div>
      ) : (viewMode === 'MATCHED' ? matchedJobs : jobs).length > 0 ? (
        <div className="space-y-4">
          {(viewMode === 'MATCHED' ? matchedJobs.map((m) => ({ ...m.job, _match: m })) : jobs).map((job) => {
            const matchInfo = job._match || getJobMatch(job.id);
            const isSaved = savedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-indigo-300 hover:shadow-sm transition flex flex-col gap-4"
              >
                {/* Top Row: Company, Title, Badges, Match % */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Company Initial / Logo Box */}
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                      {job.company ? job.company.charAt(0).toUpperCase() : '🏢'}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition"
                          onClick={() => setSelectedJob(job)}
                        >
                          {job.title}
                        </h2>
                        {job.experienceCategory === 'FRESHER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <GraduationCap className="w-3 h-3 text-amber-600" />
                            Fresher / Student
                          </span>
                        )}
                        {job.experienceCategory === 'SENIOR' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            <Briefcase className="w-3 h-3 text-purple-600" />
                            Senior / 5+ Yrs
                          </span>
                        )}
                        {job.targetAcademicYears && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            🎯 {job.targetAcademicYears}
                          </span>
                        )}
                        {job.targetBatches && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Batch {job.targetBatches}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {job.jobType || 'Full-time'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {job.workplaceType || 'Hybrid'}
                        </span>
                        {getSourceBadge(job.source, job.isMultiSource)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(job.postedDate)}
                        </span>
                        {job.salaryRange && job.salaryRange !== 'Not provided' && (
                          <span className="font-semibold text-slate-800">
                            💰 {job.salaryRange}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Score Badge (Only if verified resume exists) */}
                  <div className="flex items-center gap-2 self-start">
                    {matchInfo ? (
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          matchInfo.matchScore >= 70
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : matchInfo.matchScore >= 45
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{matchInfo.matchScore}% Match</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                        Upload resume to match
                      </span>
                    )}

                    {/* Save Job Button */}
                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                      className={`p-2 rounded-xl border transition ${
                        isSaved
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags / Resume match breakdown */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {matchInfo ? (
                    <>
                      {matchInfo.strongMatches?.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                      {matchInfo.potentialGaps?.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </>
                  ) : (
                    (job.requiredSkills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                    >
                      View Job
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                        isSaved
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isSaved ? 'Saved ✓' : 'Save Job'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTailoringJob(job)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate ATS Resume</span>
                    </button>

                    <a
                      href={getDirectApplyUrl(job)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

            );
          })}

          {/* PAGINATION CONTROLS (Only in 'ALL' viewMode) */}
          {viewMode === 'ALL' && totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <span className="text-xs text-slate-500">
                Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} positions
              </span>

              <div className="flex items-center gap-2 self-center sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="px-3 py-1.5 text-xs font-bold text-slate-700">
                  Page {currentPage + 1} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Search Match State */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No active positions matching your criteria</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing location filters, or resetting filter chips.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {selectedJob.experienceCategory === 'FRESHER' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    Fresher / Student
                  </span>
                )}
                {selectedJob.experienceCategory === 'SENIOR' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    Senior / 5+ Yrs Experience
                  </span>
                )}
                {selectedJob.targetAcademicYears && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🎯 Eligible: {selectedJob.targetAcademicYears}
                  </span>
                )}
                {selectedJob.targetBatches && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Batch: {selectedJob.targetBatches}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {selectedJob.jobType || 'Full-time'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {selectedJob.workplaceType || 'Hybrid'}
                </span>
                {getSourceBadge(selectedJob.source, selectedJob.isMultiSource)}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{selectedJob.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 mt-1">
                <span className="font-semibold text-slate-800">{selectedJob.company}</span>
                <span>•</span>
                <span>{selectedJob.location}</span>
                <span>•</span>
                <span>Posted: {formatDate(selectedJob.postedDate)}</span>
                {selectedJob.salaryRange && selectedJob.salaryRange !== 'Not provided' && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-slate-900">{selectedJob.salaryRange}</span>
                  </>
                )}
              </div>
            </div>

            {/* RESUME MATCH BREAKDOWN (If Available) */}
            {(() => {
              const match = getJobMatch(selectedJob.id);
              if (!match) return null;
              return (
                <div className="bg-gradient-to-br from-indigo-50/70 to-emerald-50/50 border border-indigo-100 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Resume Match Analysis ({match.matchScore}%)
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-700">
                      {match.requiredSkillsFoundCount} of {(selectedJob.requiredSkills || []).length} skills found
                    </span>
                  </div>

                  {/* Strong Matches */}
                  {match.strongMatches?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                        Strong Matches in Your Resume:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.strongMatches.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Potential Gaps */}
                  {match.potentialGaps?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                        Skills Not Found in Your Resume:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.potentialGaps.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-indigo-100/60">
                    💡 {match.disclaimer}
                  </p>
                </div>
              );
            })()}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                About the Position
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedJob.description}
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Required Capabilities &amp; Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(selectedJob.requiredSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition ${
                    savedJobIds.includes(selectedJob.id)
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {savedJobIds.includes(selectedJob.id) ? 'Saved ✓' : 'Save Job'}
                </button>

                <button
                  type="button"
                  onClick={() => setTailoringJob(selectedJob)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate ATS Resume</span>
                </button>
              </div>


              <a
                href={getDirectApplyUrl(selectedJob)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAILOR MY RESUME PREVIEW DIALOG */}
      {showTailorDialog && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowTailorDialog(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Tailor My Resume</h3>

            {resumeData ? (
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  You are targeting <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-semibold text-slate-800">Current Resume: {resumeData.fileName}</p>
                  <p className="text-slate-500">
                    The upcoming ATS optimization module will help re-align your project bullet points to highlight the requirements of this role.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Upload your resume first to analyze keyword alignment and prepare tailored applications.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTailorDialog(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              {!resumeData && (
                <Link
                  to="/resume"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Upload Resume
                </Link>
              )}
            </div>
          </div>
        </div>
      )}



      {/* PROVIDER HEALTH AND STATUS MODAL */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowProviderModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Job Providers Health</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                CareerAI only aggregates through legitimate authorized APIs and feeds.
              </p>
            </div>

            <div className="space-y-3">
              {providers.map((p) => {
                const isConfigured = p.status === 'ACTIVE';
                return (
                  <div
                    key={p.provider}
                    className={`p-4 rounded-2xl border transition ${
                      isConfigured
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{p.provider}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isConfigured
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.statusMessage}</p>
                    {isConfigured && p.jobCount > 0 && (
                      <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                        Active Ingested Jobs: {p.jobCount}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={triggerManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Trigger Sync Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProviderModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATS Tailored Resume Modal */}
      <AtsResumeModal
        isOpen={!!tailoringJob}
        onClose={() => setTailoringJob(null)}
        job={tailoringJob}
      />
    </div>
  );
};


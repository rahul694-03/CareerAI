import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Briefcase,
  Tag,
  Building2,
  MapPin,
  ExternalLink,
  Calendar,
  FileCheck,
  Check,
  Globe,
  Edit3,
  GraduationCap,
  Target,
  Zap,
  X,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { getPlatformLinks, getSkillsHubLinks } from '../utils/jobPlatforms';
import { AtsResumeModal } from '../components/AtsResumeModal';

export const ResumePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [notice, setNotice] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [tailoringJob, setTailoringJob] = useState(null);
  const [selectedState, setSelectedState] = useState('ALL');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('ALL'); // 'ALL' | 'FRESHER' | 'SENIOR' | 'MID_LEVEL'
  const [hideApplied, setHideApplied] = useState(false);
  const [pendingConfirmJob, setPendingConfirmJob] = useState(null);
  const fileInputRef = useRef(null);

  const STATE_FILTERS = [
    { id: 'ALL', label: 'All States / Locations' },
    { id: 'TELANGANA', label: '📍 Telangana (Hyderabad)', keywords: ['hyderabad', 'telangana'] },
    { id: 'KARNATAKA', label: '📍 Karnataka (Bengaluru)', keywords: ['bengaluru', 'bangalore', 'karnataka'] },
    { id: 'MAHARASHTRA', label: '📍 Maharashtra (Mumbai & Pune)', keywords: ['mumbai', 'pune', 'maharashtra'] },
    { id: 'DELHI_NCR', label: '📍 Delhi NCR (Delhi, Gurgaon, Noida)', keywords: ['delhi', 'gurgaon', 'gurugram', 'noida'] },
    { id: 'TAMIL_NADU', label: '📍 Tamil Nadu (Chennai)', keywords: ['chennai', 'tamil nadu', 'coimbatore'] },
    { id: 'GUJARAT', label: '📍 Gujarat (Ahmedabad)', keywords: ['ahmedabad', 'gujarat'] },
    { id: 'KERALA', label: '📍 Kerala (Kochi)', keywords: ['kochi', 'kerala'] },
    { id: 'WEST_BENGAL', label: '📍 West Bengal (Kolkata)', keywords: ['kolkata', 'calcutta', 'bengal'] },
    { id: 'REMOTE', label: '🏠 Pan-India Remote', keywords: ['remote'] },
  ];

  const getJobExpLevel = (job) => {
    const title = (job?.title || '').toLowerCase();
    const exp = (job?.experienceLevel || '').toLowerCase();
    const emp = (job?.employmentType || '').toLowerCase();

    const isSenior =
      title.includes('senior') ||
      title.includes('sr.') ||
      title.includes('lead') ||
      title.includes('staff') ||
      title.includes('principal') ||
      title.includes('manager') ||
      title.includes('director') ||
      title.includes('head') ||
      title.includes('architect') ||
      title.includes('leader') ||
      exp === 'senior' ||
      exp === 'executive';

    if (isSenior) return 'SENIOR';

    const isFresher =
      emp === 'internship' ||
      title.includes('intern') ||
      title.includes('trainee') ||
      title.includes('graduate') ||
      title.includes('university') ||
      title.includes('fresher') ||
      title.includes('junior') ||
      title.includes('entry') ||
      title.includes('associate software') ||
      title.includes('associate engineer') ||
      title.includes('l1') ||
      title.includes('student program') ||
      exp === 'fresher';

    if (isFresher) return 'FRESHER';

    return 'MID_LEVEL';
  };

  const fresherCount = matchedJobs.filter((j) => getJobExpLevel(j.job) === 'FRESHER').length;
  const seniorCount = matchedJobs.filter((j) => getJobExpLevel(j.job) === 'SENIOR').length;
  const midCount = matchedJobs.filter((j) => getJobExpLevel(j.job) === 'MID_LEVEL').length;

  const getStateCount = (filter) => {
    return matchedJobs.filter((item) => {
      // Respect current experience level filter
      if (experienceLevelFilter !== 'ALL') {
        const expLevel = getJobExpLevel(item.job);
        if (experienceLevelFilter === 'FRESHER' && expLevel !== 'FRESHER') return false;
        if (experienceLevelFilter === 'SENIOR' && expLevel !== 'SENIOR') return false;
        if (experienceLevelFilter === 'MID_LEVEL' && expLevel !== 'MID_LEVEL') return false;
      }

      if (filter.id === 'ALL') return true;
      const loc = (item.job?.location || '').toLowerCase();
      const rem = (item.job?.remoteType || '').toLowerCase();
      return filter.keywords.some((kw) => loc.includes(kw) || (filter.id === 'REMOTE' && rem.includes('remote')));
    }).length;
  };

  const interleaveJobsByCompany = (list) => {
    if (!list || list.length <= 1) return list;

    // Group into high-match tiers so relevance is preserved
    const tier1 = list.filter((j) => (j.matchScore || 0) >= 75);
    const tier2 = list.filter((j) => (j.matchScore || 0) >= 50 && (j.matchScore || 0) < 75);
    const tier3 = list.filter((j) => (j.matchScore || 0) < 50);

    const mixTier = (tier) => {
      const byCompany = {};
      tier.forEach((item) => {
        const comp = item.job?.company || 'Other';
        if (!byCompany[comp]) byCompany[comp] = [];
        byCompany[comp].push(item);
      });

      const comps = Object.keys(byCompany);
      const mixed = [];
      let round = 0;
      let hasMore = true;
      while (hasMore) {
        hasMore = false;
        for (const c of comps) {
          if (round < byCompany[c].length) {
            mixed.push(byCompany[c][round]);
            hasMore = true;
          }
        }
        round++;
      }
      return mixed;
    };

    return [...mixTier(tier1), ...mixTier(tier2), ...mixTier(tier3)];
  };

  const rawFilteredJobs = matchedJobs.filter((item) => {
    // 0. Hide already applied if toggled
    if (hideApplied && appliedJobIds.includes(item.job.id)) {
      return false;
    }

    // 1. Experience level filter
    if (experienceLevelFilter !== 'ALL') {
      const expLevel = getJobExpLevel(item.job);
      if (experienceLevelFilter === 'FRESHER' && expLevel !== 'FRESHER') return false;
      if (experienceLevelFilter === 'SENIOR' && expLevel !== 'SENIOR') return false;
      if (experienceLevelFilter === 'MID_LEVEL' && expLevel !== 'MID_LEVEL') return false;
    }

    // 2. Location filter
    if (selectedState === 'ALL') return true;
    const filter = STATE_FILTERS.find((f) => f.id === selectedState);
    if (!filter || !filter.keywords) return true;
    const loc = (item.job?.location || '').toLowerCase();
    const rem = (item.job?.remoteType || '').toLowerCase();
    return filter.keywords.some((kw) => loc.includes(kw) || (selectedState === 'REMOTE' && rem.includes('remote')));
  });

  const displayedMatchedJobs = interleaveJobsByCompany(rawFilteredJobs);

  const handleOpenDirectApply = (job, customUrl, source = 'Direct Requisition') => {
    const realUrl = customUrl || job.applyUrl || job.applicationUrl || job.sourceUrl;
    if (realUrl) {
      window.open(realUrl, '_blank', 'noopener,noreferrer');
      setPendingConfirmJob({
        job,
        url: realUrl,
        source,
      });
    } else {
      alert('Direct apply link is currently unavailable for this position.');
    }
  };

  const handleRapidApplyNext = () => {
    const unapplied = displayedMatchedJobs.filter((item) => !appliedJobIds.includes(item.job.id));
    if (unapplied.length > 0) {
      const next = unapplied[0];
      handleOpenDirectApply(next.job, null, 'Rapid Apply');
    } else {
      alert('🎉 Congratulations! You have applied to all displayed jobs in this view!');
    }
  };

  const handleConfirmApplication = (didApply) => {
    if (!pendingConfirmJob) return;

    if (didApply) {
      const { job, source } = pendingConfirmJob;
      handleTrackApply(job.id, source);
      setNotice({
        type: 'success',
        message: `Application submitted for "${job.title}" at ${job.company}! Daily target updated (+1).`,
      });
    } else {
      setNotice({
        type: 'info',
        message: `Application was not marked as submitted. No change made to your submitted count.`,
      });
    }

    setPendingConfirmJob(null);
  };

  useEffect(() => {
    fetchResumeAndMatches();
  }, []);

  const fetchResumeAndMatches = async () => {
    setIsLoading(true);
    try {
      const res = await resumeService.getMyResume();
      if (res.success && res.data) {
        setResumeData(res.data);
        await loadMatchedJobs();
      }

      const appliedRes = await applicationService.getAppliedJobIds();
      if (appliedRes.success && appliedRes.data) {
        setAppliedJobIds(appliedRes.data);
      }
    } catch (err) {
      console.error('Error fetching resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatchedJobs = async () => {
    try {
      const matchRes = await jobService.getMatchedJobs();
      if (matchRes.success && matchRes.data) {
        setMatchedJobs(matchRes.data);
      }
    } catch (e) {
      console.error('Error loading matched jobs:', e);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setNotice({
        type: 'error',
        message: 'Invalid file format. Please upload a PDF, DOCX, or TXT file.',
      });
      return;
    }

    setSelectedFile(file);
    setNotice(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setNotice(null);

    try {
      const res = await resumeService.uploadResume(selectedFile);
      if (res.success && res.data) {
        setResumeData(res.data);
        setSelectedFile(null);
        await loadMatchedJobs();
        setNotice({
          type: 'success',
          message: `Resume analyzed! Extracted ${res.data.extractedSkills?.length || 0} skills. See your matched jobs and direct apply links below!`,
        });
      } else {
        setNotice({
          type: 'error',
          message: res.message || 'Failed to process resume.',
        });
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to upload and parse resume. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTrackApply = (jobId, platformName) => {
    applicationService.applyToJob(jobId, platformName).then(() => {
      setAppliedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
    }).catch((err) => console.error(err));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
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

  const getScoreBadgeBg = (score) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Resume Match &amp; Direct Apply
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume to automatically extract your skills, get instant AI-matched jobs &amp; internships, and apply directly.
        </p>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-3 border transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notice.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : notice.type === 'info' ? (
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {notice.type === 'success'
                ? 'Application Tracked!'
                : notice.type === 'info'
                ? 'Status Update'
                : 'Notice'}
            </p>
            <p className="text-xs mt-0.5 opacity-90">{notice.message}</p>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resume Upload / Update Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {resumeData ? 'Upload or Update Resume' : 'Upload Your Resume'}
            </h2>
            <p className="text-xs text-slate-500">
              Accepts PDF, DOCX, or TXT. AI extracts your skills and finds matching live jobs with direct apply links.
            </p>
          </div>
          {resumeData && (
            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Active: {resumeData.fileName}</span>
              </div>
              <button
                type="button"
                id="edit-resume-btn"
                onClick={() => setTailoringJob({ title: 'Software Engineer', company: 'ATS Standard' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                title="Open 1-Page Resume with Bold, Bullets, and Inline Editing Tools"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>✏️ Edit &amp; Customize Resume</span>
              </button>
            </div>
          )}
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/20'
              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
              <p className="text-xs text-indigo-600 font-semibold">Click or drop another file to change</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Upload className="w-7 h-7 text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Drag &amp; drop your resume here, or <span className="text-indigo-600">browse files</span>
              </p>
              <p className="text-xs text-slate-400">PDF, DOCX, or TXT up to 10MB</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleUpload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume &amp; Matching Jobs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze &amp; Get Direct Apply Links</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Extracted Skills Section */}
      {resumeData && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Skills Identified in Your Resume ({resumeData.extractedSkills?.length || 0})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Matched to active jobs below</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(resumeData.extractedSkills || []).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CLAUDE-STYLE DIRECT MATCHING JOBS LIST WITH DIRECT APPLY LINKS */}
      {resumeData && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>🎯 Matched Jobs &amp; Direct Apply Links</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  {matchedJobs.length} Found
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Every job matches your extracted skills. Click any link below to open the direct application page.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto"
            >
              <span>View Full Jobs Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* DAILY APPLICATION SPRINT TARGET (50 - 100 APPLICATIONS / DAY) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Daily Application Sprint Target
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                      Goal: 50–100 / Day
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Jobs are updated daily from official ATS portals. Apply directly using the verified links to hit your target!
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-2 max-w-lg space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {appliedJobIds.length} Submitted Today
                  </span>
                  <span className="text-slate-400">
                    Daily Goal: 50–100 ({Math.min(100, Math.round((appliedJobIds.length / 50) * 100))}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, (appliedJobIds.length / 50) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideApplied}
                  onChange={(e) => setHideApplied(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold">Hide Already Applied</span>
              </label>

              <button
                type="button"
                onClick={handleRapidApplyNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                title="Automatically open the next unapplied direct job application requisition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Rapid Apply Next ({displayedMatchedJobs.filter((i) => !appliedJobIds.includes(i.job.id)).length} Left)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Experience Track: Freshers vs Seniors vs Mid vs All */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Experience Level: Freshers &amp; Seniors
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Separate tabs for college graduates / freshers and senior / staff roles
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-300 self-start sm:self-auto font-medium">
                Showing <strong className="text-amber-400">{displayedMatchedJobs.length}</strong> matching jobs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setExperienceLevelFilter('FRESHER')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  experienceLevelFilter === 'FRESHER'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    🎓 Freshers
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white">
                    {fresherCount}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-1 line-clamp-1">Internships &amp; Grads (0-2 yrs)</p>
              </button>

              <button
                type="button"
                onClick={() => setExperienceLevelFilter('SENIOR')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  experienceLevelFilter === 'SENIOR'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    💼 Seniors
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white">
                    {seniorCount}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-1 line-clamp-1">Senior, Staff, Lead, Architect</p>
              </button>

              <button
                type="button"
                onClick={() => setExperienceLevelFilter('MID_LEVEL')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  experienceLevelFilter === 'MID_LEVEL'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    🚀 Mid-Level
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white">
                    {midCount}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-1 line-clamp-1">Software Engineers, SDE II</p>
              </button>

              <button
                type="button"
                onClick={() => setExperienceLevelFilter('ALL')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  experienceLevelFilter === 'ALL'
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    🌟 All Levels
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white">
                    {matchedJobs.length}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-1 line-clamp-1">Show all career stages</p>
              </button>
            </div>
          </div>

          {/* Location-Wise State Filter Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Filter Active Jobs by Indian State &amp; Location:</span>
              </span>
              <span className="text-slate-500">
                Showing <strong className="text-slate-900">{displayedMatchedJobs.length}</strong> active opportunities in{' '}
                <span className="text-indigo-600 font-bold">
                  {STATE_FILTERS.find((f) => f.id === selectedState)?.label || 'All States'}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {STATE_FILTERS.map((pill) => {
                const count = getStateCount(pill);
                const isSelected = selectedState === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedState(pill.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live External Platforms Direct Search Hub (Indeed, LinkedIn, Google Jobs) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🚀</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Live Platform Direct Search (LinkedIn, Indeed &amp; Google Jobs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Instant 1-click verified live search queries matching your extracted skills with active positions.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full self-start sm:self-auto border border-indigo-100">
                100% Real Direct Searches
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {getSkillsHubLinks(resumeData?.parsedSkills || resumeData?.skills || ['Software Engineer']).map((hub) => (
                <a
                  key={hub.name}
                  href={hub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700 text-xs font-bold transition shadow-2xs ${hub.color}`}
                >
                  <span className="text-sm">{hub.icon}</span>
                  <span className="truncate">{hub.name.split(' ')[0]}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {displayedMatchedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {displayedMatchedJobs.map((item) => {
                const job = item.job;
                const matchScore = item.matchScore;
                const matchedSkills = item.matchedSkills || [];
                const isApplied = appliedJobIds.includes(job.id);
                const platforms = getPlatformLinks(job);

                const platMap = platforms.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-indigo-300 hover:shadow-sm transition flex flex-col gap-4"
                  >
                    {/* Top Row: Title, Company, Match Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">{job.title}</h3>
                          {getJobExpLevel(job) === 'FRESHER' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🎓 Fresher / Graduate
                            </span>
                          ) : getJobExpLevel(job) === 'SENIOR' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              💼 Senior / Staff
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              🚀 Mid-Level SDE
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {job.jobType}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            {job.workplaceType}
                          </span>
                          {job.applyUrl?.includes('greenhouse') ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              🌿 Greenhouse Direct
                            </span>
                          ) : job.applyUrl?.includes('lever.co') ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              ⚡ Lever Requisition
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              🏢 Official ATS
                            </span>
                          )}
                          {isApplied && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" />
                              Applied
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          {job.salaryRange && (
                            <span className="font-semibold text-slate-700">💰 {job.salaryRange}</span>
                          )}
                        </div>
                      </div>

                      {/* Match Score */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 self-start ${getScoreBadgeBg(
                          matchScore
                        )}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{matchScore}% Match</span>
                      </div>
                    </div>

                    {/* Matched Skills Pill Row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-1">Skills Matched:</span>
                      {matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* DIRECT APPLY & ATS RESUME BUTTONS ROW */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Generate ATS Tailored Resume Button */}
                        <button
                          type="button"
                          onClick={() => setTailoringJob(job)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate ATS Resume</span>
                        </button>

                        {/* Direct Requisition Link */}
                        <button
                          type="button"
                          onClick={() => handleOpenDirectApply(job, job.applyUrl || platMap.official?.url, `Direct (${job.company})`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <span>Direct Apply ({job.company})</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        {/* Direct LinkedIn Link */}
                        <a
                          href={platMap.linkedin?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-semibold transition shadow-xs"
                        >
                          <span>Apply on LinkedIn</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>

                        {/* Direct Indeed Link */}
                        <a
                          href={platMap.indeed?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2164f3] hover:bg-[#1b52c7] text-white text-xs font-semibold transition shadow-xs"
                        >
                          <span>Apply on Indeed</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>

                        {/* Direct Google Jobs Link */}
                        <a
                          href={platMap.googlejobs?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
                        >
                          <span>Google Jobs</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Tailor resume to job keywords &amp; direct apply
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-800">No high-confidence matches found yet.</p>
              <p className="text-xs text-slate-500">
                Upload a resume with more technical or discipline-specific keywords to unlock tailored direct apply opportunities.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Real Application Confirmation Modal */}
      {pendingConfirmJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Application Confirmation</h3>
                  <p className="text-xs text-slate-400">Daily Sprint Tracker (Goal: 50–100 / Day)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleConfirmApplication(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close without updating count"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Job Info Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {pendingConfirmJob.job?.company}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                    {pendingConfirmJob.job?.jobType || 'Full-time'}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {pendingConfirmJob.job?.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {pendingConfirmJob.job?.location || 'India'}
                  </span>
                  {pendingConfirmJob.job?.salaryRange && (
                    <span className="font-semibold text-slate-700">
                      💰 {pendingConfirmJob.job.salaryRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Link Information */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3.5 py-2.5">
                <span className="truncate pr-2">
                  Direct official application opened in a new tab.
                </span>
                <a
                  href={pendingConfirmJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-bold shrink-0 underline"
                >
                  <span>Reopen Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Question */}
              <div className="text-center space-y-1.5 py-1">
                <p className="text-base font-bold text-slate-900">
                  Did you complete and submit your application?
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  If you applied, confirm below to increase your submitted count. If not, click <strong>"No, Not Yet"</strong> and your count will not change.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmApplication(false)}
                  className="flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition cursor-pointer shadow-xs hover:border-slate-300"
                >
                  <span className="flex items-center gap-1.5 text-rose-600 font-extrabold">
                    <X className="w-4 h-4" />
                    No, Not Yet
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal mt-0.5">
                    (No update to count)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmApplication(true)}
                  className="flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm transition cursor-pointer shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center gap-1.5 font-extrabold text-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                    Yes, Applied!
                  </span>
                  <span className="text-[11px] text-emerald-100 font-normal mt-0.5">
                    (+1 to Submitted Today)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATS Tailored Resume Modal */}
      <AtsResumeModal
        isOpen={!!tailoringJob}
        onClose={() => setTailoringJob(null)}
        job={tailoringJob}
        onApplyTrack={handleTrackApply}
      />
    </div>
  );
};


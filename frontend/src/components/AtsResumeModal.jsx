import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Printer,
  Edit3,
  Eye,
  ShieldCheck,
  Tag,
  Loader2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  Download,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';

export const AtsResumeModal = ({ isOpen, onClose, job, onApplyTrack }) => {
  const [loading, setLoading] = useState(false);
  const [tailoredData, setTailoredData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [initialSnapshotHtml, setInitialSnapshotHtml] = useState(null);

  const resumePrintRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (job?.id) {
        loadTailoredResume();
      } else {
        loadCustomTailoredResume();
      }
    }
  }, [isOpen, job?.id]);

  const loadTailoredResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeService.tailorResumeForJob(job.id);
      if (res.success && res.data) {
        setTailoredData(res.data);
      } else {
        setError(res.message || 'Failed to tailor resume.');
      }
    } catch (err) {
      console.error('Error generating tailored resume:', err);
      setError(err.response?.data?.message || 'Failed to generate ATS resume. Please ensure you have uploaded your resume.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomTailoredResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeService.tailorResumeCustom({
        jobTitle: job?.title || 'Software Engineer',
        company: job?.company || 'Target Requisition',
        jobDescription: job?.description || ''
      });
      if (res.success && res.data) {
        setTailoredData(res.data);
      } else {
        setError(res.message || 'Failed to generate resume.');
      }
    } catch (err) {
      console.error('Error generating resume:', err);
      setError(err.response?.data?.message || 'Failed to load resume. Please ensure you have uploaded your resume first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Save initial HTML snapshot for Reset functionality
    if (tailoredData && resumePrintRef.current && !initialSnapshotHtml) {
      setTimeout(() => {
        if (resumePrintRef.current) {
          setInitialSnapshotHtml(resumePrintRef.current.innerHTML);
        }
      }, 300);
    }
  }, [tailoredData, initialSnapshotHtml]);

  if (!isOpen) return null;

  // Rich text formatting actions
  const applyFormat = (command, value = null) => {
    if (!isEditing) {
      setIsEditing(true);
    }
    // Focus back on resume
    if (resumePrintRef.current) {
      resumePrintRef.current.focus();
    }
    document.execCommand(command, false, value);
  };

  const handleAddLink = () => {
    const url = prompt('Enter URL (e.g. https://github.com/your-username or https://linkedin.com/in/...):');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  const handleResetToOriginal = () => {
    if (window.confirm('Reset all your edits back to original resume layout?')) {
      if (initialSnapshotHtml && resumePrintRef.current) {
        resumePrintRef.current.innerHTML = initialSnapshotHtml;
      } else if (job?.id) {
        loadTailoredResume();
      } else {
        loadCustomTailoredResume();
      }
    }
  };

  const handleDownloadHtml = () => {
    if (!resumePrintRef.current) return;
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${tailoredData?.candidateName || 'Resume'} - 1-Page ATS Resume</title>
  <style>
    body { font-family: "Times New Roman", Times, Georgia, serif; margin: 40px auto; max-width: 800px; color: #000; font-size: 12.5px; line-height: 1.35; }
    h1 { text-align: center; font-size: 24px; margin-bottom: 2px; text-transform: uppercase; }
    h2 { font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 10px; margin-bottom: 4px; }
    a { color: #0000ee; text-decoration: underline; }
    ul { padding-left: 20px; margin: 2px 0; }
    li { margin-bottom: 2px; }
  </style>
</head>
<body>
${resumePrintRef.current.innerHTML}
</body>
</html>`;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(tailoredData?.candidateName || 'Resume').replace(/\\s+/g, '_')}_1Page_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyPlainText = () => {
    let textToCopy = '';
    if (resumePrintRef.current) {
      textToCopy = resumePrintRef.current.innerText;
    } else if (tailoredData) {
      textToCopy = tailoredData.rawAtsPlainText || '';
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDirectApply = () => {
    if (onApplyTrack && job?.id) {
      onApplyTrack(job.id, 'Direct Requisition');
    }
    const url = job?.applyUrl || job?.applicationUrl || tailoredData?.applyUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const applyUrl = job?.applyUrl || job?.applicationUrl || tailoredData?.applyUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header - Screen only */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">1-Page ATS Resume &amp; Rich Editor</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Target: {job?.company || 'General ATS Requisition'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Exact single-page format &bull; Inline editable with Bold, Italic, Bullets, and Links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Status Bar - Screen only */}
        {tailoredData && !loading && (
          <div className="px-6 py-2 bg-indigo-50/80 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2.5 print:hidden shrink-0">
            {/* ATS Score & Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-indigo-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  ATS Match: <span className="text-emerald-700 font-extrabold">{tailoredData.atsScore || 85}%</span>
                </span>
              </div>
              <span className="hidden sm:inline text-xs text-slate-600 font-medium">
                1-Page Single Column &bull; Times New Roman serif &bull; Live Editor
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isEditing
                    ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                }`}
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Editing Active' : '✏️ Edit Resume'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPlainText}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                title="Copy clean plain text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Plain Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                title="Download HTML file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Save HTML</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Download or Print 1-page PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save 1-Page PDF</span>
              </button>

              {applyUrl && (
                <button
                  type="button"
                  onClick={handleDirectApply}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  <span>Direct Apply</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* FULL WYSIWYG FORMATTING TOOLBAR (Always easily accessible when editing) */}
        {isEditing && (
          <div className="px-4 sm:px-6 py-2 bg-slate-900 text-slate-200 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 print:hidden shrink-0 transition-all">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Tools:
              </span>

              {/* Bold / Unbold */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                title="Bold / Unbold (Ctrl+B) - Select text and click to toggle bold"
              >
                <Bold className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="font-extrabold">Bold / Unbold</span>
              </button>

              {/* Italic */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white italic text-xs flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
                <span>Italic</span>
              </button>

              {/* Underline */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
                <span className="underline">Underline</span>
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('strikeThrough'); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center border border-slate-700 transition cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5 line-through" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              {/* Bullet List */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('insertUnorderedList'); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                title="Insert Bullet Point (•)"
              >
                <List className="w-3.5 h-3.5" />
                <span>• Bullet</span>
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('insertOrderedList'); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                title="Insert Numbered List (1, 2, 3)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>1. Number</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyLeft'); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyCenter'); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyRight'); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              {/* Add Link */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleAddLink(); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                title="Add Hyperlink to selected text"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link</span>
              </button>

              {/* Unlink */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('unlink'); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Remove Hyperlink"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>

              {/* Clear Formatting */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('removeFormat'); }}
                className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Clear Formatting"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              {/* Undo */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('undo'); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Redo */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat('redo'); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset to Original */}
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-slate-700 hover:border-rose-700 transition cursor-pointer"
              title="Reset all modifications back to original resume"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 print:p-0 print:overflow-visible">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Formatting 1-Page ATS Resume...</p>
                <p className="text-xs text-slate-500 mt-1">Aligning your actual resume with {job?.company} job keywords</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
              <p className="text-sm font-bold">Unable to Load Resume</p>
              <p className="text-xs text-rose-800 mt-1">{error}</p>
            </div>
          )}

          {tailoredData && !loading && (
            <div className="space-y-3">
              
              {/* Keywords Match Advisory Ribbon - Screen only */}
              <div className="p-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 print:hidden">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Keywords Alignment for {job?.title} at {job?.company}
                  </span>
                  {isEditing && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      ✏️ Edit Mode Active — Click any text below to modify
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(tailoredData.matchedKeywords || []).map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-[11px] font-semibold"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {kw} (In Resume)
                    </span>
                  ))}
                  {(tailoredData.missingKeywords || []).slice(0, 8).map((kw, i) => (
                    <span
                      key={`miss-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px]"
                      title="From job requirements"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* EXACT 1-PAGE ATS RESUME SHEET (WITH CONTENT-EDITABLE CAPABILITY) */}
              <div
                ref={resumePrintRef}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                className={`bg-white shadow-sm p-6 sm:p-9 font-serif text-slate-950 max-w-[800px] mx-auto text-[12px] sm:text-[12.5px] leading-[1.35] transition-all outline-none print:border-none print:p-0 print:shadow-none print:text-black print:max-w-none print:w-full ${
                  isEditing
                    ? 'border-2 border-dashed border-amber-400 ring-4 ring-amber-100/50 cursor-text'
                    : 'border border-slate-300'
                }`}
                style={{
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                }}
              >
                {/* 1. Header: Candidate Name, Tagline, Contact Line */}
                <div className="text-center pb-2">
                  <h1 className="text-2xl sm:text-[26px] font-bold tracking-normal uppercase text-slate-950">
                    {tailoredData.candidateName || 'RAHUL PENTA'}
                  </h1>
                  
                  {tailoredData.tagline && (
                    <div className="text-[13px] font-semibold text-slate-850 mt-0.5">
                      {tailoredData.tagline}
                    </div>
                  )}

                  <div className="text-[11.5px] sm:text-[12px] text-slate-800 mt-0.5 flex flex-wrap items-center justify-center gap-x-1.5">
                    {tailoredData.location && <span>{tailoredData.location}</span>}
                    {tailoredData.location && <span>|</span>}
                    {tailoredData.phone && <span>{tailoredData.phone}</span>}
                    {tailoredData.phone && <span>|</span>}
                    <span className="font-medium">{tailoredData.candidateEmail}</span>
                    {tailoredData.githubUrl && <span>|</span>}
                    {tailoredData.githubUrl && (
                      <span className="text-blue-900">{tailoredData.githubUrl}</span>
                    )}
                  </div>
                </div>

                {/* 2. Section: PROFESSIONAL SUMMARY */}
                {tailoredData.professionalSummary && (
                  <div className="mt-2.5">
                    <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                      Professional Summary
                    </h2>
                    <p className="mt-1 text-slate-900 text-justify">
                      {tailoredData.professionalSummary}
                    </p>
                  </div>
                )}

                {/* 3. Section: TECHNICAL SKILLS */}
                {tailoredData.categorizedSkills && Object.keys(tailoredData.categorizedSkills).length > 0 ? (
                  <div className="mt-2.5">
                    <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                      Technical Skills
                    </h2>
                    <div className="mt-1 space-y-0.5 text-slate-900">
                      {Object.entries(tailoredData.categorizedSkills).map(([category, skills]) => (
                        <div key={category}>
                          <span className="font-bold">{category}: </span>
                          <span>{skills}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  tailoredData.coreSkills && tailoredData.coreSkills.length > 0 && (
                    <div className="mt-2.5">
                      <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                        Technical Skills
                      </h2>
                      <div className="mt-1 space-y-0.5 text-slate-900">
                        <div>
                          <span className="font-bold">Skills: </span>
                          <span>{tailoredData.coreSkills.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* 4. Section: PROJECTS */}
                {tailoredData.projectItems && tailoredData.projectItems.length > 0 && (
                  <div className="mt-2.5">
                    <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                      Projects
                    </h2>
                    <div className="mt-1 space-y-2">
                      {tailoredData.projectItems.map((proj, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-bold text-slate-950">
                            {proj.projectTitle}
                          </div>
                          {proj.techStack && (
                            <div className="italic text-slate-800 text-[11.5px]">
                              {proj.techStack}
                            </div>
                          )}
                          {proj.projectLink && (
                            <div className="text-[11px] text-blue-800 underline">
                              Link: <a href={proj.projectLink} target="_blank" rel="noopener noreferrer">{proj.projectLink}</a>
                            </div>
                          )}
                          {proj.bulletPoints && proj.bulletPoints.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-900">
                              {proj.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx}>{bp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Section: INTERNSHIP EXPERIENCE */}
                {tailoredData.experienceItems && tailoredData.experienceItems.length > 0 && (
                  <div className="mt-2.5">
                    <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                      Internship Experience
                    </h2>
                    <div className="mt-1 space-y-2">
                      {tailoredData.experienceItems.map((exp, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline font-bold text-slate-950">
                            <span>{exp.roleTitle}</span>
                            <span className="font-normal text-[11.5px] text-slate-800">{exp.duration}</span>
                          </div>
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-900">
                              {exp.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx}>{bp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Section: EDUCATION */}
                {tailoredData.educationItems && tailoredData.educationItems.length > 0 ? (
                  <div className="mt-2.5">
                    <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                      Education
                    </h2>
                    <div className="mt-1 space-y-1">
                      {tailoredData.educationItems.map((edu, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline font-bold text-slate-950">
                            <span>{edu.institution}</span>
                            <span className="font-normal text-[11.5px] text-slate-800">{edu.duration}</span>
                          </div>
                          {edu.gradeDetails && (
                            <div className="italic text-slate-800 text-[11.5px]">
                              {edu.gradeDetails}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  tailoredData.educationSummary && (
                    <div className="mt-2.5">
                      <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                        Education
                      </h2>
                      <div className="mt-1 text-slate-900 font-medium">
                        {tailoredData.educationSummary}
                      </div>
                    </div>
                  )
                )}

                {/* 7. Section: CERTIFICATIONS & ACHIEVEMENTS */}
                {tailoredData.certifications && tailoredData.certifications.length > 0 && (
                  <div className="mt-2.5">
                    <h2 className="text-[13px] font-bold text-slate-950 uppercase border-b border-slate-900 pb-0.5 tracking-normal">
                      Certifications &amp; Achievements
                    </h2>
                    <ul className="mt-1 list-disc list-outside pl-4 space-y-0.5 text-slate-900">
                      {tailoredData.certifications.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {/* Footer actions - Screen only */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
          <p className="text-xs text-slate-500">
            📄 Standard 1-Page Layout with Times New Roman serif typography &amp; full ATS compliance.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyPlainText}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy ATS Plain Text'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            {applyUrl && (
              <button
                type="button"
                onClick={handleDirectApply}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Direct Apply ({job?.company})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

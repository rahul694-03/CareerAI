import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { DEGREES, GRADUATION_YEARS, ACADEMIC_YEARS } from '../utils/constants';
import { User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    degree: '',
    college: '',
    graduationYear: '',
    academicYear: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        degree: user.degree || '',
        college: user.college || '',
        graduationYear: user.graduationYear ? String(user.graduationYear) : '',
        academicYear: user.academicYear || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'academicYear') {
        const match = ACADEMIC_YEARS.find((y) => y.id === value);
        if (match && !prev.graduationYear) {
          updated.graduationYear = String(match.gradYear);
        }
      } else if (name === 'graduationYear' && value) {
        const yr = parseInt(value, 10);
        const match = ACADEMIC_YEARS.find((y) => y.gradYear === yr);
        if (match && !prev.academicYear) {
          updated.academicYear = match.id;
        }
      }
      return updated;
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Name is required');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        degree: formData.degree ? formData.degree : null,
        college: formData.college.trim() ? formData.college.trim() : null,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        academicYear: formData.academicYear ? formData.academicYear : null,
      };

      const res = await userService.updateProfile(payload);
      if (res && res.success && res.data) {
        updateUser(res.data);
        setSuccessMessage('Your profile has been updated successfully.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your student education background and personal details
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar and Info Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{formData.name || 'Student Name'}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/40 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-slate-400 font-normal lowercase">(cannot be changed)</span>
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Academic Standing */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Academic Year / Stage</span>
              <span className="text-[11px] font-normal text-indigo-600">Used to filter fresher jobs & internships</span>
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/40 focus:bg-white focus:border-indigo-500 focus:outline-none transition font-medium text-slate-800"
            >
              <option value="">Select Academic Standing</option>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label} — {y.focus}
                </option>
              ))}
            </select>
          </div>

          {/* Degree and Grad Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Degree / Program
              </label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/40 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="">Select Degree</option>
                {DEGREES.map((deg) => (
                  <option key={deg} value={deg}>
                    {deg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Graduation Year
              </label>
              <select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/40 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="">Select Year</option>
                {GRADUATION_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* College */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              College / University
            </label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="e.g. Indian Institute of Technology, Delhi University"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/40 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

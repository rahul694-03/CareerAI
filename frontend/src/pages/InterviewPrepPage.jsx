import React from 'react';
import { GraduationCap } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const InterviewPrepPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Preparation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Role-specific mock questions, coding challenges, and HR preparation
        </p>
      </div>

      <div className="pt-8">
        <EmptyState
          icon={GraduationCap}
          title="Your interview preparation will appear here after you apply to a job."
          description="CareerAI generates personalized technical and behavioral preparation sets specifically tuned to each company and job role you target."
          actionText="Find Jobs"
          actionTo="/jobs"
        />
      </div>
    </div>
  );
};

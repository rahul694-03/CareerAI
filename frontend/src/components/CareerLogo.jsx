import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CareerLogo = ({ size = 'md', linkTo = '/' }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const content = (
    <div className="flex items-center gap-2.5 font-bold tracking-tight">
      <div className={`rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 ${
        isSmall ? 'w-7 h-7' : isLarge ? 'w-11 h-11' : 'w-9 h-9'
      }`}>
        <Sparkles className={isSmall ? 'w-4 h-4' : isLarge ? 'w-6 h-6' : 'w-5 h-5'} />
      </div>
      <div className={`flex items-center font-extrabold ${
        isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
      }`}>
        <span className="text-slate-900">Career</span>
        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI</span>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="inline-flex items-center hover:opacity-95 transition">{content}</Link>;
  }

  return content;
};

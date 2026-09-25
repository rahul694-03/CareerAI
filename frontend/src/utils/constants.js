export const DEGREES = [
  'B.Tech',
  'B.E.',
  'BCA',
  'MCA',
  'B.Sc',
  'M.Sc',
  'B.Com',
  'M.Com',
  'BBA',
  'MBA',
  'BA',
  'MA',
  'Diploma',
  'Pharmacy',
  'Nursing',
  'Law',
  'Other',
];

export const GRADUATION_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

export const ACADEMIC_YEARS = [
  { id: '1st Year', label: '1st Year (Undergraduate)', gradYear: 2030, focus: 'Internships & Technical Skills' },
  { id: '2nd Year', label: '2nd Year (Undergraduate)', gradYear: 2029, focus: 'Internships & Projects' },
  { id: '3rd Year', label: '3rd Year (Pre-Final Year)', gradYear: 2028, focus: 'Summer Internships & PPO' },
  { id: '4th Year', label: '4th Year (Final Year)', gradYear: 2027, focus: 'Campus Hiring & Full-Time Fresher' },
  { id: 'Fresh Graduate', label: 'Fresh Graduate (2025-2026)', gradYear: 2026, focus: 'Immediate Entry-Level (0-2 Yrs)' },
];

export const getAcademicStageFromYear = (gradYear) => {
  if (!gradYear) return 'Student';
  const yr = Number(gradYear);
  if (yr === 2027) return '4th Year (Final Year)';
  if (yr === 2028) return '3rd Year (Pre-Final Year)';
  if (yr === 2029) return '2nd Year (Undergraduate)';
  if (yr >= 2030) return '1st Year (Undergraduate)';
  if (yr <= 2026) return `Fresh Graduate (Batch ${yr})`;
  return 'Student';
};

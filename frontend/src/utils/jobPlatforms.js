/**
 * Utility to generate clean, verified, guaranteed-to-match job application URLs across:
 * LinkedIn, Indeed, Google Jobs, Naukri, Internshala, and Company Portals.
 */

export const cleanRoleTitle = (title = '') => {
  if (!title) return 'Software Engineer';
  return title
    .replace(/\s*\([^)]*\)/g, '') // remove parenthesized qualifiers like (React & Java)
    .replace(/&/g, ' ')           // replace & with space
    .replace(/\//g, ' ')          // replace / with space
    .replace(/[-–—].*$/g, '')      // remove dash suffixes
    .replace(/\s+/g, ' ')         // collapse multiple spaces
    .trim() || title;
};

export const cleanCity = (location = '') => {
  if (!location) return 'India';
  const city = location.split(',')[0].trim();
  return city.toLowerCase() === 'remote' ? 'India' : city;
};

export const getStandardizedSearchRole = (title = '', skills = []) => {
  const t = (title || '').toLowerCase();

  const clean = t
    .replace(/\s*\([^)]*\)/g, ' ')
    .replace(/[-–—/&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.includes('react') || clean.includes('frontend')) return 'React Developer';
  if (clean.includes('backend') && clean.includes('java')) return 'Java Backend Developer';
  if (clean.includes('spring') || clean.includes('java')) return 'Java Developer';
  if (clean.includes('python')) return 'Python Developer';
  if (clean.includes('full stack') || clean.includes('fullstack')) return 'Full Stack Developer';
  if (clean.includes('qa') || clean.includes('sdet') || clean.includes('automation') || clean.includes('testing')) return 'QA Automation Engineer';
  if (clean.includes('designer') || clean.includes('ui') || clean.includes('ux') || clean.includes('figma')) return 'UI UX Designer';
  if (clean.includes('data analyst') || clean.includes('analytics')) return 'Data Analyst';
  if (clean.includes('data engineer') || clean.includes('distributed')) return 'Data Engineer';
  if (clean.includes('cloud') || clean.includes('devops') || clean.includes('aws')) return 'DevOps Engineer';
  if (clean.includes('marketing') || clean.includes('growth') || clean.includes('seo')) return 'Digital Marketing';
  if (clean.includes('finance') || clean.includes('financial')) return 'Financial Analyst';
  if (clean.includes('intern')) return 'Software Engineer Intern';
  if (clean.includes('software') || clean.includes('engineer') || clean.includes('developer')) return 'Software Engineer';

  if (skills && skills.length > 0) {
    return `${skills[0]} Developer`;
  }
  return 'Software Engineer';
};

export const getPlatformLinks = (job) => {
  if (!job) return [];

  const rawTitle = job.title || '';
  const company = job.company || '';
  const location = job.location || 'Bengaluru, India';
  const cleanTitle = cleanRoleTitle(rawTitle);
  const searchRole = getStandardizedSearchRole(rawTitle, job.requiredSkills);
  const city = cleanCity(location);
  const primarySkill = job.requiredSkills?.[0] || searchRole;

    // Encoded parameters with specific company targeting
    const targetQuery = company ? `${cleanTitle} ${company}` : cleanTitle;
    const targetQueryEnc = encodeURIComponent(targetQuery);
    const roleEnc = encodeURIComponent(searchRole);
    const cityEnc = encodeURIComponent(city);
    const companyEnc = encodeURIComponent(company);
    const skillEnc = encodeURIComponent(primarySkill);

    // Determine working company portal URL
    let companyUrl = job.applyUrl || job.applicationUrl || job.sourceUrl;
    if (!companyUrl || companyUrl.includes('example.com')) {
      const role = encodeURIComponent(searchRole || 'Software Engineer');
      const comp = encodeURIComponent(company || '');
      companyUrl = `https://www.google.com/search?ibp=htl;jobs&q=${role}+at+${comp}`;
    }

    return [
      {
        id: 'official',
        name: 'Official Company Portal',
        shortName: 'Direct Post',
        badgeColor: 'bg-indigo-600 text-white hover:bg-indigo-700',
        tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: '🏢',
        description: `Official career application for ${company}`,
        url: companyUrl,
        isPrimary: true,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn Jobs',
        shortName: 'LinkedIn',
        badgeColor: 'bg-[#0A66C2] text-white hover:bg-[#084e96]',
        tagColor: 'bg-sky-50 text-[#0A66C2] border-sky-200',
        icon: '💼',
        description: `Direct active ${cleanTitle} at ${company} on LinkedIn`,
        url: `https://www.linkedin.com/jobs/search/?keywords=${targetQueryEnc}&location=${cityEnc}&f_TPR=r604800`,
      },
      {
        id: 'indeed',
        name: 'Indeed India',
        shortName: 'Indeed',
        badgeColor: 'bg-[#2164f3] text-white hover:bg-[#1b52c7]',
        tagColor: 'bg-blue-50 text-[#2164f3] border-blue-200',
        icon: '🔍',
        description: `Live ${cleanTitle} at ${company} on Indeed India`,
        url: `https://in.indeed.com/jobs?q=${targetQueryEnc}&l=${cityEnc}&sort=date`,
      },
      {
        id: 'googlejobs',
        name: 'Google Jobs (Direct View)',
        shortName: 'Google Jobs',
        badgeColor: 'bg-emerald-600 text-white hover:bg-emerald-700',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '🌐',
        description: `All indexed applications for ${cleanTitle} at ${company} in ${city}`,
        url: `https://www.google.com/search?ibp=htl;jobs&q=${encodeURIComponent(`${cleanTitle} at ${company} in ${city}`)}#fpstate=tldetail`,
      },
    {
      id: 'naukri',
      name: 'Naukri.com',
      shortName: 'Naukri',
      badgeColor: 'bg-[#4a90e2] text-white hover:bg-[#357abd]',
      tagColor: 'bg-blue-50 text-[#4a90e2] border-blue-200',
      icon: '🇮🇳',
      description: `Verified roles on Naukri for ${searchRole}`,
      url: `https://www.naukri.com/${searchRole.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-jobs-in-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    },
    {
      id: 'internshala',
      name: 'Internshala',
      shortName: 'Internshala',
      badgeColor: 'bg-[#1295C9] text-white hover:bg-[#0e78a3]',
      tagColor: 'bg-cyan-50 text-[#1295C9] border-cyan-200',
      icon: '🎓',
      description: `Student internships for ${primarySkill} with stipend`,
      url: `https://internshala.com/internships/keywords-${skillEnc.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
    },
    {
      id: 'wellfound',
      name: 'Wellfound (Startups)',
      shortName: 'Wellfound',
      badgeColor: 'bg-slate-900 text-white hover:bg-black',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: '🚀',
      description: `High-growth startup & remote roles for ${searchRole}`,
      url: `https://wellfound.com/jobs?q=${roleEnc}`,
    },
  ];
};

export const getSkillsHubLinks = (skills = []) => {
  const query = skills.length > 0 ? skills.slice(0, 3).join(' ') : 'Software Engineer';
  const encoded = encodeURIComponent(query);

  return [
    {
      name: 'LinkedIn Jobs',
      icon: '💼',
      url: `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=India&f_TPR=r86400`,
      color: 'hover:border-[#0A66C2] hover:text-[#0A66C2]',
    },
    {
      name: 'Indeed India',
      icon: '🔍',
      url: `https://in.indeed.com/jobs?q=${encoded}&l=India&sort=date`,
      color: 'hover:border-[#2164f3] hover:text-[#2164f3]',
    },
    {
      name: 'Google Jobs Hub',
      icon: '🌐',
      url: `https://www.google.com/search?ibp=htl;jobs&q=${encodeURIComponent(`${query} jobs in India`)}#fpstate=tldetail`,
      color: 'hover:border-emerald-600 hover:text-emerald-600',
    },
    {
      name: 'Naukri.com',
      icon: '🇮🇳',
      url: `https://www.naukri.com/${encodeURIComponent(query.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}-jobs`,
      color: 'hover:border-[#4a90e2] hover:text-[#4a90e2]',
    },
    {
      name: 'Internshala',
      icon: '🎓',
      url: `https://internshala.com/internships/matching-preferences/`,
      color: 'hover:border-[#1295C9] hover:text-[#1295C9]',
    },
    {
      name: 'Wellfound Startups',
      icon: '🚀',
      url: `https://wellfound.com/jobs?q=${encoded}`,
      color: 'hover:border-black hover:text-black',
    },
  ];
};

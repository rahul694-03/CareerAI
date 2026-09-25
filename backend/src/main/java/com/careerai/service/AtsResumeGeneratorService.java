package com.careerai.service;

import com.careerai.dto.AtsTailoredResumeDto;
import com.careerai.dto.AtsTailoredResumeDto.EducationItemDto;
import com.careerai.dto.AtsTailoredResumeDto.ExperienceItemDto;
import com.careerai.dto.AtsTailoredResumeDto.ProjectItemDto;
import com.careerai.entity.Job;
import com.careerai.entity.Resume;
import com.careerai.entity.User;
import com.careerai.exception.ResourceNotFoundException;
import com.careerai.repository.JobRepository;
import com.careerai.repository.ResumeRepository;
import com.careerai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AtsResumeGeneratorService {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;

    public AtsResumeGeneratorService(JobRepository jobRepository,
                                     ResumeRepository resumeRepository,
                                     UserRepository userRepository,
                                     ResumeParserService resumeParserService) {
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
    }

    @Transactional(readOnly = true)
    public AtsTailoredResumeDto generateAtsResumeForJob(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        Optional<Resume> resumeOpt = resumeRepository.findByUser(user);

        return buildTailoredResume(user, resumeOpt.orElse(null), job.getTitle(), job.getCompany(),
                job.getLocation(), job.getApplicationUrl(), job.getDescription(), job.getSkills(), job.getId());
    }

    @Transactional(readOnly = true)
    public AtsTailoredResumeDto generateAtsResumeCustom(String userEmail, String jobTitle, String company, String description) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Optional<Resume> resumeOpt = resumeRepository.findByUser(user);

        return buildTailoredResume(user, resumeOpt.orElse(null), jobTitle, company,
                "Remote / On-site", null, description, Collections.emptyList(), null);
    }

    private AtsTailoredResumeDto buildTailoredResume(User user,
                                                     Resume resume,
                                                     String targetJobTitle,
                                                     String targetCompany,
                                                     String location,
                                                     String applyUrl,
                                                     String jobDescription,
                                                     List<String> jobSkills,
                                                     Long jobId) {

        AtsTailoredResumeDto dto = new AtsTailoredResumeDto();
        dto.setJobId(jobId);
        dto.setJobTitle(targetJobTitle != null ? targetJobTitle : "Software Development Engineer");
        dto.setCompany(targetCompany != null ? targetCompany : "Target Organization");
        dto.setLocation(location != null ? location : "Flexible / Remote");
        dto.setApplyUrl(applyUrl);

        String rawText = (resume != null && resume.getRawText() != null) ? resume.getRawText() : "";

        // Parse header metadata (Name, Tagline, Phone, Location, GitHub, LinkedIn) from rawText if available
        parseHeaderDetails(dto, rawText, user);

        // Parse sections from resume rawText
        Map<String, List<String>> parsedSections = parseResumeSections(rawText);

        // Extract skills strictly from the candidate's uploaded resume
        List<String> candidateSkills = resume != null && resume.getExtractedSkills() != null
                ? new ArrayList<>(resume.getExtractedSkills())
                : new ArrayList<>();

        // Extract target job keywords from job description & required skills
        Set<String> targetJobKeywords = new LinkedHashSet<>();
        if (jobSkills != null) {
            targetJobKeywords.addAll(jobSkills);
        }
        if (jobDescription != null && !jobDescription.isBlank()) {
            List<String> descSkills = resumeParserService.extractSkills(jobDescription);
            targetJobKeywords.addAll(descSkills);
        }

        dto.setTargetJobKeywords(new ArrayList<>(targetJobKeywords));

        // Calculate matched skills: strictly candidate's actual skills that are present in job keywords
        Set<String> normalizedCandidateSkills = candidateSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String kw : targetJobKeywords) {
            if (normalizedCandidateSkills.contains(kw.toLowerCase())) {
                matched.add(kw);
            } else {
                missing.add(kw);
            }
        }

        dto.setMatchedKeywords(matched);
        dto.setMissingKeywords(missing);

        // ATS Score based purely on real keyword alignment
        int matchCount = matched.size();
        int totalTarget = Math.max(1, targetJobKeywords.size());
        double ratio = (double) matchCount / totalTarget;
        int atsScore = (int) Math.min(100, Math.max(55, Math.round(55 + (ratio * 45))));
        dto.setAtsScore(atsScore);

        // Categorized Skills parsed from resume
        List<String> skillSectionLines = parsedSections.getOrDefault("SKILLS", Collections.emptyList());
        Map<String, String> categorizedSkills = extractCategorizedSkills(skillSectionLines);
        dto.setCategorizedSkills(categorizedSkills);

        // Fallback or flat skill lists
        List<String> coreSkills = new ArrayList<>();
        for (String s : candidateSkills) {
            if (matched.stream().anyMatch(m -> m.equalsIgnoreCase(s))) {
                coreSkills.add(s);
            }
        }
        List<String> remainingSkills = new ArrayList<>();
        for (String s : candidateSkills) {
            if (!coreSkills.contains(s)) {
                remainingSkills.add(s);
            }
        }
        dto.setCoreSkills(coreSkills.isEmpty() ? candidateSkills : coreSkills);
        dto.setTechnicalSkills(coreSkills.isEmpty() ? Collections.emptyList() : remainingSkills);

        // Parse Professional Summary strictly from candidate's resume
        List<String> summaryLines = parsedSections.getOrDefault("SUMMARY", Collections.emptyList());
        String summary;
        if (!summaryLines.isEmpty()) {
            summary = String.join(" ", summaryLines);
        } else {
            summary = String.format("Dedicated %s graduate from %s with hands-on skills in %s, applying for %s at %s.",
                    dto.getDegree(),
                    dto.getCollege(),
                    String.join(", ", candidateSkills.stream().limit(4).toList()),
                    dto.getJobTitle(),
                    dto.getCompany());
        }
        dto.setProfessionalSummary(summary);

        // Parse Projects strictly from candidate's resume
        List<String> projectSectionLines = parsedSections.getOrDefault("PROJECTS", Collections.emptyList());
        List<ProjectItemDto> parsedProjects = extractProjects(projectSectionLines);
        dto.setProjectItems(parsedProjects);

        // Parse Experience / Internships strictly from candidate's resume
        List<String> experienceSectionLines = parsedSections.getOrDefault("EXPERIENCE", Collections.emptyList());
        List<ExperienceItemDto> parsedExperience = extractExperience(experienceSectionLines);
        dto.setExperienceItems(parsedExperience);

        // Parse Education strictly from candidate's resume
        List<String> eduLines = parsedSections.getOrDefault("EDUCATION", Collections.emptyList());
        List<EducationItemDto> educationItems = extractEducation(eduLines, user);
        dto.setEducationItems(educationItems);
        if (!educationItems.isEmpty()) {
            EducationItemDto first = educationItems.get(0);
            dto.setEducationSummary(first.getInstitution() + " - " + first.getDegree() + (first.getDuration() != null ? " (" + first.getDuration() + ")" : ""));
        } else {
            dto.setEducationSummary(user.getCollege() != null ? user.getCollege() + " - " + user.getDegree() : "University Degree");
        }

        // Parse Certifications & Achievements strictly from candidate's resume
        List<String> certLines = parsedSections.getOrDefault("CERTIFICATIONS", Collections.emptyList());
        List<String> certifications = extractCertifications(certLines);
        dto.setCertifications(certifications);

        // Build Plain-Text ATS format matching user's layout
        dto.setRawAtsPlainText(buildRawAtsText(dto));

        return dto;
    }

    private void parseHeaderDetails(AtsTailoredResumeDto dto, String rawText, User user) {
        dto.setCandidateName(user.getName());
        dto.setCandidateEmail(user.getEmail());
        dto.setDegree(user.getDegree() != null ? user.getDegree() : "B.Tech, CSE");
        dto.setCollege(user.getCollege() != null ? user.getCollege() : "Engineering College");
        dto.setGraduationYear(user.getGraduationYear());

        if (rawText == null || rawText.isBlank()) return;

        String[] lines = rawText.split("\\r?\\n");
        if (lines.length > 0 && !lines[0].trim().isEmpty()) {
            String l0 = lines[0].trim();
            if (!l0.equalsIgnoreCase("RESUME") && !l0.equalsIgnoreCase("CURRICULUM VITAE") && l0.length() < 50) {
                dto.setCandidateName(l0);
            }
        }

        // Inspect first 5 lines for phone, location, links, tagline
        for (int i = 1; i < Math.min(6, lines.length); i++) {
            String l = lines[i].trim();
            if (l.isEmpty() || detectSectionHeader(l) != null) break;

            if (l.contains("|") && (l.contains("@") || l.matches(".*\\d{10}.*") || l.toLowerCase().contains("github"))) {
                String[] parts = l.split("\\|");
                for (String part : parts) {
                    String p = part.trim();
                    if (p.contains("@")) {
                        dto.setCandidateEmail(p);
                    } else if (p.matches(".*(\\+?\\d[\\d\\s-]{8,15}\\d).*")) {
                        dto.setPhone(p);
                    } else if (p.toLowerCase().contains("github.com")) {
                        dto.setGithubUrl(p);
                    } else if (p.toLowerCase().contains("linkedin.com")) {
                        dto.setLinkedinUrl(p);
                    } else if (p.length() > 2 && p.length() < 35 && !p.contains("http")) {
                        dto.setLocation(p);
                    }
                }
            } else if (l.contains("|") && (l.toLowerCase().contains("engineer") || l.toLowerCase().contains("developer") || l.toLowerCase().contains("java") || l.toLowerCase().contains("react"))) {
                dto.setTagline(l);
            }
        }
    }

    private Map<String, List<String>> parseResumeSections(String rawText) {
        Map<String, List<String>> sections = new LinkedHashMap<>();
        if (rawText == null || rawText.isBlank()) {
            return sections;
        }

        String[] lines = rawText.split("\\r?\\n");
        String currentSection = null;

        for (String rawLine : lines) {
            String trimmed = rawLine.trim();
            if (trimmed.isEmpty()) continue;

            String detected = detectSectionHeader(trimmed);
            if (detected != null) {
                currentSection = detected;
                sections.putIfAbsent(currentSection, new ArrayList<>());
            } else if (currentSection != null) {
                sections.get(currentSection).add(trimmed);
            }
        }

        return sections;
    }

    private String detectSectionHeader(String line) {
        String clean = line.replaceAll("[:#*_-]", "").trim().toUpperCase();
        if (clean.length() > 40) return null;

        if (clean.matches("^(PROFESSIONAL\\s+)?SUMMARY$") ||
            clean.matches("^CAREER\\s+OBJECTIVE$") ||
            clean.matches("^OBJECTIVE$") ||
            clean.matches("^PROFILE$")) {
            return "SUMMARY";
        }

        if (clean.matches("^(TECHNICAL\\s+)?SKILLS(\\s+&\\s+COMPETENCIES)?$") ||
            clean.matches("^KEY\\s+SKILLS$") ||
            clean.matches("^CORE\\s+COMPETENCIES$")) {
            return "SKILLS";
        }

        if (clean.matches("^PROJECTS$") ||
            clean.matches("^ACADEMIC\\s+PROJECTS$") ||
            clean.matches("^KEY\\s+PROJECTS$") ||
            clean.matches("^TECHNICAL\\s+PROJECTS$")) {
            return "PROJECTS";
        }

        if (clean.matches("^(INTERNSHIP\\s+)?EXPERIENCE$") ||
            clean.matches("^WORK\\s+EXPERIENCE$") ||
            clean.matches("^PROFESSIONAL\\s+EXPERIENCE$") ||
            clean.matches("^INTERNSHIPS?$")) {
            return "EXPERIENCE";
        }

        if (clean.matches("^EDUCATION$") ||
            clean.matches("^ACADEMIC\\s+BACKGROUND$") ||
            clean.matches("^ACADEMICS$")) {
            return "EDUCATION";
        }

        if (clean.matches("^CERTIFICATIONS(\\s+&\\s+ACHIEVEMENTS)?$") ||
            clean.matches("^ACHIEVEMENTS$") ||
            clean.matches("^AWARDS$")) {
            return "CERTIFICATIONS";
        }

        return null;
    }

    private Map<String, String> extractCategorizedSkills(List<String> lines) {
        Map<String, String> map = new LinkedHashMap<>();
        if (lines == null || lines.isEmpty()) return map;

        for (String line : lines) {
            int colonIdx = line.indexOf(':');
            if (colonIdx > 0 && colonIdx < 35) {
                String cat = line.substring(0, colonIdx).trim();
                String val = line.substring(colonIdx + 1).trim();
                map.put(cat, val);
            }
        }
        return map;
    }

    private List<ProjectItemDto> extractProjects(List<String> lines) {
        List<ProjectItemDto> projects = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return projects;

        ProjectItemDto current = null;

        for (String line : lines) {
            String trimmed = line.trim();
            boolean isBullet = trimmed.startsWith("•") || trimmed.startsWith("*") || trimmed.startsWith("-");
            String cleanText = trimmed.replaceAll("^[•*\\-o–]\\s*", "").trim();

            if (trimmed.toLowerCase().startsWith("link:")) {
                if (current != null) {
                    current.setProjectLink(trimmed.substring(5).trim());
                }
            } else if (isBullet) {
                if (current != null) {
                    current.getBulletPoints().add(cleanText);
                }
            } else {
                // Check if this is a subtitle/tech stack line (e.g. "React, Spring Boot, PostgreSQL, ...")
                if (current != null && current.getBulletPoints().isEmpty() && (current.getTechStack() == null || current.getTechStack().isEmpty())) {
                    current.setTechStack(trimmed);
                } else {
                    // New project
                    current = new ProjectItemDto(trimmed, "", new ArrayList<>());
                    projects.add(current);
                }
            }
        }

        return projects;
    }

    private List<ExperienceItemDto> extractExperience(List<String> lines) {
        List<ExperienceItemDto> experiences = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return experiences;

        ExperienceItemDto current = null;

        for (String line : lines) {
            String trimmed = line.trim();
            boolean isBullet = trimmed.startsWith("•") || trimmed.startsWith("*") || trimmed.startsWith("-");
            String cleanText = trimmed.replaceAll("^[•*\\-o–]\\s*", "").trim();

            if (isBullet) {
                if (current != null) {
                    current.getBulletPoints().add(cleanText);
                }
            } else {
                // New experience header e.g. "Prodigy Infotech - Data Science Intern Jul 2025"
                String role = trimmed;
                String duration = "";
                // Detect date at the end of line like "Jul 2025" or "2024 - Present"
                Pattern datePattern = Pattern.compile("(?i)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\\d{4})[\\s\\d–-]*$");
                Matcher m = datePattern.matcher(trimmed);
                if (m.find()) {
                    duration = m.group().trim();
                    role = trimmed.substring(0, m.start()).trim();
                }
                current = new ExperienceItemDto(role, "", duration, new ArrayList<>());
                experiences.add(current);
            }
        }

        return experiences;
    }

    private List<EducationItemDto> extractEducation(List<String> lines, User user) {
        List<EducationItemDto> list = new ArrayList<>();
        if (lines == null || lines.isEmpty()) {
            if (user.getCollege() != null) {
                list.add(new EducationItemDto(user.getCollege(), user.getDegree(),
                        user.getGraduationYear() != null ? String.valueOf(user.getGraduationYear()) : "", ""));
            }
            return list;
        }

        EducationItemDto current = null;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.toLowerCase().startsWith("cgpa:") || trimmed.toLowerCase().startsWith("12th") || trimmed.toLowerCase().contains("percentage:")) {
                if (current != null) {
                    current.setGradeDetails(trimmed);
                }
            } else {
                String inst = trimmed;
                String dur = "";
                Pattern datePattern = Pattern.compile("(\\d{4}\\s*[-–]\\s*\\d{4}|\\d{4})\\s*$");
                Matcher m = datePattern.matcher(trimmed);
                if (m.find()) {
                    dur = m.group().trim();
                    inst = trimmed.substring(0, m.start()).trim();
                }
                current = new EducationItemDto(inst, "", dur, "");
                list.add(current);
            }
        }

        return list;
    }

    private List<String> extractCertifications(List<String> lines) {
        List<String> list = new ArrayList<>();
        if (lines == null) return list;
        for (String l : lines) {
            String clean = l.replaceAll("^[•*\\-o–]\\s*", "").trim();
            if (!clean.isEmpty()) {
                list.add(clean);
            }
        }
        return list;
    }

    private String buildRawAtsText(AtsTailoredResumeDto dto) {
        StringBuilder sb = new StringBuilder();
        sb.append(dto.getCandidateName().toUpperCase()).append("\n");
        if (dto.getTagline() != null && !dto.getTagline().isBlank()) {
            sb.append(dto.getTagline()).append("\n");
        }
        sb.append(String.format("%s | %s | %s | %s\n\n",
                dto.getLocation() != null ? dto.getLocation() : "Location",
                dto.getPhone() != null ? dto.getPhone() : "+91-XXXXXXXXXX",
                dto.getCandidateEmail(),
                dto.getGithubUrl() != null ? dto.getGithubUrl() : "github.com"));

        if (dto.getProfessionalSummary() != null && !dto.getProfessionalSummary().isBlank()) {
            sb.append("PROFESSIONAL SUMMARY\n");
            sb.append("--------------------\n");
            sb.append(dto.getProfessionalSummary()).append("\n\n");
        }

        if (!dto.getCategorizedSkills().isEmpty()) {
            sb.append("TECHNICAL SKILLS\n");
            sb.append("----------------\n");
            for (Map.Entry<String, String> entry : dto.getCategorizedSkills().entrySet()) {
                sb.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
            }
            sb.append("\n");
        }

        if (!dto.getProjectItems().isEmpty()) {
            sb.append("PROJECTS\n");
            sb.append("--------\n");
            for (ProjectItemDto p : dto.getProjectItems()) {
                sb.append(p.getProjectTitle()).append("\n");
                if (p.getTechStack() != null && !p.getTechStack().isBlank()) {
                    sb.append(p.getTechStack()).append("\n");
                }
                if (p.getProjectLink() != null && !p.getProjectLink().isBlank()) {
                    sb.append("Link: ").append(p.getProjectLink()).append("\n");
                }
                for (String b : p.getBulletPoints()) {
                    sb.append(" * ").append(b).append("\n");
                }
                sb.append("\n");
            }
        }

        if (!dto.getExperienceItems().isEmpty()) {
            sb.append("INTERNSHIP EXPERIENCE\n");
            sb.append("---------------------\n");
            for (ExperienceItemDto exp : dto.getExperienceItems()) {
                sb.append(exp.getRoleTitle()).append("   ").append(exp.getDuration()).append("\n");
                for (String b : exp.getBulletPoints()) {
                    sb.append(" * ").append(b).append("\n");
                }
                sb.append("\n");
            }
        }

        if (!dto.getEducationItems().isEmpty()) {
            sb.append("EDUCATION\n");
            sb.append("---------\n");
            for (EducationItemDto edu : dto.getEducationItems()) {
                sb.append(edu.getInstitution()).append("   ").append(edu.getDuration()).append("\n");
                if (edu.getGradeDetails() != null && !edu.getGradeDetails().isBlank()) {
                    sb.append(edu.getGradeDetails()).append("\n");
                }
            }
            sb.append("\n");
        }

        if (!dto.getCertifications().isEmpty()) {
            sb.append("CERTIFICATIONS & ACHIEVEMENTS\n");
            sb.append("-----------------------------\n");
            for (String cert : dto.getCertifications()) {
                sb.append(" * ").append(cert).append("\n");
            }
            sb.append("\n");
        }

        return sb.toString();
    }
}

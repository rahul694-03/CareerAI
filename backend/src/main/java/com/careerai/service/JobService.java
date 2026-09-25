package com.careerai.service;

import com.careerai.dto.JobDto;
import com.careerai.dto.JobMatchDto;
import com.careerai.dto.JobSearchCriteria;
import com.careerai.dto.PageResponse;
import com.careerai.entity.Job;
import com.careerai.exception.ResourceNotFoundException;
import com.careerai.repository.JobRepository;
import com.careerai.repository.JobSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final ResumeService resumeService;
    private final com.careerai.repository.UserRepository userRepository;
    private final JobClassificationService classificationService;

    public JobService(JobRepository jobRepository, ResumeService resumeService,
                      com.careerai.repository.UserRepository userRepository,
                      JobClassificationService classificationService) {
        this.jobRepository = jobRepository;
        this.resumeService = resumeService;
        this.userRepository = userRepository;
        this.classificationService = classificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<JobDto> searchJobs(JobSearchCriteria criteria, Pageable pageable) {
        Specification<Job> spec = JobSpecification.withCriteria(criteria);
        Page<Job> page = jobRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public List<JobMatchDto> getMatchedJobsForUser(String userEmail) {
        List<String> userSkills = resumeService.getUserSkills(userEmail);
        if (userSkills.isEmpty()) {
            return Collections.emptyList();
        }

        com.careerai.entity.User user = userRepository.findByEmail(userEmail).orElse(null);
        Integer gradYear = user != null ? user.getGraduationYear() : null;
        String academicYear = user != null ? user.getDerivedAcademicYear() : null;

        Set<String> normalizedUserSkills = userSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<Job> activeJobs = jobRepository.findByIsActiveTrue();
        List<JobMatchDto> matchedList = new ArrayList<>();

        for (Job job : activeJobs) {
            String expCat = job.getResolvedExperienceCategory();
            // STUDENTS / FRESHERS SHOULD NOT BE GIVEN SENIOR / LEAD / STAFF ROLES
            if ("SENIOR".equalsIgnoreCase(expCat) || job.getExperienceLevel() == com.careerai.entity.ExperienceLevel.SENIOR || job.getExperienceLevel() == com.careerai.entity.ExperienceLevel.EXECUTIVE) {
                continue;
            }

            List<String> reqSkills = job.getSkills() != null ? job.getSkills() : Collections.emptyList();
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            for (String reqSkill : reqSkills) {
                if (normalizedUserSkills.contains(reqSkill.toLowerCase())) {
                    matched.add(reqSkill);
                } else {
                    missing.add(reqSkill);
                }
            }

            // Also check if any user skill appears in title or description
            String titleAndDesc = (job.getTitle() + " " + (job.getDescription() != null ? job.getDescription() : "")).toLowerCase();
            for (String uSkill : userSkills) {
                if (titleAndDesc.contains(uSkill.toLowerCase()) && !matched.contains(uSkill)) {
                    matched.add(uSkill);
                }
            }

            if (!matched.isEmpty()) {
                int totalPoints = Math.max(1, reqSkills.size());
                int baseScore = (int) Math.round(((double) matched.size() / totalPoints) * 100);

                // ACADEMIC STAGE RELEVANCE BOOST
                int academicBoost = 0;
                boolean isInternship = job.getEmploymentType() == com.careerai.entity.EmploymentType.INTERNSHIP;
                boolean isFresher = job.getExperienceLevel() == com.careerai.entity.ExperienceLevel.FRESHER;

                if (gradYear != null) {
                    if (gradYear == 2027) {
                        // 4th Year (Final Year - Batch 2027): Boost Campus hiring, GET & full-time fresher
                        if (isFresher) {
                            academicBoost = 20;
                        } else if (isInternship) {
                            academicBoost = 15;
                        }
                    } else if (gradYear >= 2028) {
                        // 1st, 2nd, 3rd year students (Batch 2028+): Boost internships & summer PPO tracks
                        if (isInternship) {
                            academicBoost = 20;
                        } else if (isFresher) {
                            academicBoost = 10;
                        }
                    } else {
                        // Fresh graduates (<= 2026 Batch): Boost full-time entry roles
                        if (isFresher) {
                            academicBoost = 20;
                        }
                    }
                }

                int finalScore = Math.min(100, Math.max(25, baseScore + academicBoost));

                JobDto jobDto = mapToDto(job);
                matchedList.add(new JobMatchDto(jobDto, finalScore, matched, missing));
            }
        }

        // Sort primarily by matchScore descending, then by postedDate
        matchedList.sort((a, b) -> {
            int scoreCompare = Integer.compare(b.getMatchScore(), a.getMatchScore());
            if (scoreCompare != 0) {
                return scoreCompare;
            }
            if (b.getJob().getPostedDate() != null && a.getJob().getPostedDate() != null) {
                return b.getJob().getPostedDate().compareTo(a.getJob().getPostedDate());
            }
            return 0;
        });

        // Interleave across companies and platforms so users get a rich, varied mix
        return interleaveByCompany(matchedList);
    }

    private List<JobMatchDto> interleaveByCompany(List<JobMatchDto> list) {
        if (list == null || list.size() <= 1) {
            return list;
        }

        // Partition into match score tiers so highest matches remain priority:
        // Tier 1: 75% - 100% Match
        // Tier 2: 50% - 74% Match
        // Tier 3: < 50% Match
        List<JobMatchDto> tier1 = new ArrayList<>();
        List<JobMatchDto> tier2 = new ArrayList<>();
        List<JobMatchDto> tier3 = new ArrayList<>();

        for (JobMatchDto item : list) {
            int score = item.getMatchScore();
            if (score >= 75) {
                tier1.add(item);
            } else if (score >= 50) {
                tier2.add(item);
            } else {
                tier3.add(item);
            }
        }

        List<JobMatchDto> result = new ArrayList<>(list.size());
        result.addAll(roundRobinCompanies(tier1));
        result.addAll(roundRobinCompanies(tier2));
        result.addAll(roundRobinCompanies(tier3));
        return result;
    }

    private List<JobMatchDto> roundRobinCompanies(List<JobMatchDto> tier) {
        if (tier.isEmpty()) return tier;

        Map<String, List<JobMatchDto>> byCompany = new LinkedHashMap<>();
        for (JobMatchDto item : tier) {
            String comp = item.getJob() != null && item.getJob().getCompany() != null
                    ? item.getJob().getCompany()
                    : "Other";
            byCompany.computeIfAbsent(comp, k -> new ArrayList<>()).add(item);
        }

        List<JobMatchDto> roundRobin = new ArrayList<>(tier.size());
        int maxLen = byCompany.values().stream().mapToInt(List::size).max().orElse(0);

        for (int i = 0; i < maxLen; i++) {
            for (List<JobMatchDto> companyJobs : byCompany.values()) {
                if (i < companyJobs.size()) {
                    roundRobin.add(companyJobs.get(i));
                }
            }
        }
        return roundRobin;
    }

    @Transactional(readOnly = true)
    public List<JobDto> getAllActiveJobs() {
        return jobRepository.findByIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return mapToDto(job);
    }

    public JobDto mapToDto(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setSource(job.getSource());
        dto.setSourceJobId(job.getSourceJobId());
        dto.setSourceUrl(job.getSourceUrl());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setCompanyLogo(job.getCompanyLogo());
        dto.setDescription(job.getDescription());
        dto.setLocation(job.getLocation());
        dto.setCountry(job.getCountry());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setJobType(job.getJobType());
        dto.setWorkplaceType(job.getWorkplaceType());
        dto.setRequiredSkills(job.getSkills());
        dto.setSkills(job.getSkills());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setSalaryCurrency(job.getSalaryCurrency());
        dto.setSalaryPeriod(job.getSalaryPeriod());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setIsActive(job.getIsActive());
        String directUrl = job.getApplyUrl();
        if (directUrl == null || directUrl.trim().isEmpty()) {
            directUrl = job.getApplicationUrl();
        }
        if (directUrl == null || directUrl.trim().isEmpty()) {
            directUrl = job.getSourceUrl();
        }
        dto.setApplyUrl(directUrl);
        dto.setApplicationUrl(directUrl);
        dto.setPostedDate(job.getPostedDate());
        dto.setDeadline(job.getDeadline());
        dto.setRemoteType(job.getRemoteType());
        dto.setLastFetchedAt(job.getLastFetchedAt());
        dto.setIsMultiSource(job.getIsMultiSource());
        dto.setOtherSources(job.getOtherSources());
        dto.setExperienceCategory(job.getResolvedExperienceCategory());
        dto.setTargetAcademicYears(job.getTargetAcademicYears());
        dto.setTargetBatches(job.getTargetBatches());
        return dto;
    }

    @Transactional
    public int reclassifyAllJobs() {
        List<Job> allJobs = jobRepository.findAll();
        int updated = 0;
        for (Job job : allJobs) {
            JobClassificationService.ClassificationResult res =
                    classificationService.classify(job.getTitle(), job.getDescription(), job.getEmploymentType());
            job.setExperienceLevel(res.getExperienceLevel());
            job.setEmploymentType(res.getEmploymentType());
            job.setExperienceCategory(res.getExperienceCategory());
            job.setTargetAcademicYears(res.getTargetAcademicYears());
            job.setTargetBatches(res.getTargetBatches());
            updated++;
        }
        jobRepository.saveAll(allJobs);
        return updated;
    }
}

package com.careerai.service;

import com.careerai.dto.NormalizedJobDto;
import com.careerai.dto.ProviderStatusDto;
import com.careerai.entity.Job;
import com.careerai.entity.JobSource;
import com.careerai.entity.ProviderStatus;
import com.careerai.repository.JobRepository;
import com.careerai.service.provider.JobProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class JobIngestionService {

    private static final Logger log = LoggerFactory.getLogger(JobIngestionService.class);

    private final List<JobProvider> providers;
    private final JobRepository jobRepository;
    private final JobClassificationService classificationService;

    public JobIngestionService(List<JobProvider> providers, JobRepository jobRepository,
                               JobClassificationService classificationService) {
        this.providers = providers;
        this.jobRepository = jobRepository;
        this.classificationService = classificationService;
    }

    @Transactional
    public synchronized Map<String, Object> syncAllProviders() {
        log.info("Starting Job Ingestion Pipeline across {} configured providers...", providers.size());
        int totalFetched = 0;
        int totalSaved = 0;
        int totalUpdated = 0;
        int totalDuplicates = 0;
        int totalInvalid = 0;

        List<String> currentRunSourceJobIds = new ArrayList<>();

        for (JobProvider provider : providers) {
            JobSource source = provider.getSourceName();
            ProviderStatus status = provider.getProviderStatus();

            if (status != ProviderStatus.ACTIVE) {
                log.info("Provider {} status is {}: Skipping fetch. Zero scraping, zero fake fallback.", source, status);
                continue;
            }

            try {
                List<NormalizedJobDto> rawJobs = provider.fetchJobs();
                totalFetched += rawJobs.size();

                for (NormalizedJobDto dto : rawJobs) {
                    // 1. Validation Step
                    if (!isValidJob(dto)) {
                        totalInvalid++;
                        continue;
                    }

                    currentRunSourceJobIds.add(dto.getSourceJobId());

                    // 2. Classify accurately with JobClassificationService
                    JobClassificationService.ClassificationResult classRes =
                            classificationService.classify(dto.getTitle(), dto.getDescription(), dto.getEmploymentType());

                    // 3. Deduplication Step (by source + sourceJobId, or company + title + location)
                    Optional<Job> existingOpt = findExistingJob(dto);

                    if (existingOpt.isPresent()) {
                        Job existing = existingOpt.get();
                        // Update existing job
                        existing.setTitle(dto.getTitle());
                        existing.setDescription(dto.getDescription());
                        existing.setApplicationUrl(dto.getApplicationUrl());
                        existing.setSkills(dto.getSkills());
                        existing.setLastFetchedAt(LocalDateTime.now());
                        existing.setIsActive(true);
                        existing.setExperienceLevel(classRes.getExperienceLevel());
                        existing.setEmploymentType(classRes.getEmploymentType());
                        existing.setExperienceCategory(classRes.getExperienceCategory());
                        existing.setTargetAcademicYears(classRes.getTargetAcademicYears());
                        existing.setTargetBatches(classRes.getTargetBatches());

                        if (existing.getSource() != dto.getSource()) {
                            existing.setIsMultiSource(true);
                            String other = existing.getOtherSources();
                            if (other == null || other.isEmpty()) {
                                existing.setOtherSources(dto.getSource().name());
                            } else if (!other.contains(dto.getSource().name())) {
                                existing.setOtherSources(other + ", " + dto.getSource().name());
                            }
                        }

                        jobRepository.save(existing);
                        totalUpdated++;
                        totalDuplicates++;
                    } else {
                        // 4. New Job Ingestion
                        Job newJob = new Job(
                                null,
                                dto.getSource(),
                                dto.getSourceJobId(),
                                dto.getSourceUrl(),
                                dto.getTitle(),
                                dto.getCompany(),
                                dto.getCompanyLogo(),
                                dto.getDescription(),
                                dto.getLocation(),
                                dto.getCountry(),
                                classRes.getEmploymentType(),
                                classRes.getExperienceLevel(),
                                dto.getSkills(),
                                dto.getSalaryMin(),
                                dto.getSalaryMax(),
                                dto.getSalaryCurrency(),
                                dto.getSalaryPeriod(),
                                dto.getPostedDate() != null ? dto.getPostedDate() : LocalDateTime.now(),
                                dto.getDeadline(),
                                dto.getApplicationUrl(),
                                dto.getRemoteType(),
                                dto.getIsActive() != null ? dto.getIsActive() : true,
                                LocalDateTime.now(),
                                false,
                                null
                        );
                        newJob.setExperienceCategory(classRes.getExperienceCategory());
                        newJob.setTargetAcademicYears(classRes.getTargetAcademicYears());
                        newJob.setTargetBatches(classRes.getTargetBatches());

                        jobRepository.save(newJob);
                        totalSaved++;
                    }
                }
            } catch (Exception e) {
                log.error("Error during ingestion from provider {}: {}", source, e.getMessage(), e);
            }
        }

        // 4. Active Job Filter & Stale Deactivation
        // Deactivate jobs whose deadline has passed
        deactivateExpiredJobs();

        log.info("Ingestion completed: Fetched: {}, Newly Saved: {}, Updated: {}, Duplicates: {}, Invalid: {}",
                totalFetched, totalSaved, totalUpdated, totalDuplicates, totalInvalid);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFetched", totalFetched);
        summary.put("totalSaved", totalSaved);
        summary.put("totalUpdated", totalUpdated);
        summary.put("totalDuplicates", totalDuplicates);
        summary.put("totalActiveInDb", jobRepository.countByIsActiveTrue());
        return summary;
    }

    private boolean isValidJob(NormalizedJobDto dto) {
        if (dto == null) return false;
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) return false;
        if (dto.getCompany() == null || dto.getCompany().trim().isEmpty()) return false;
        if (dto.getApplicationUrl() == null || dto.getApplicationUrl().trim().isEmpty()) return false;
        if (dto.getApplicationUrl().contains("example.com")) return false;

        // India / Remote Eligibility Filter
        String loc = dto.getLocation() != null ? dto.getLocation().toLowerCase() : "";
        String country = dto.getCountry() != null ? dto.getCountry().toLowerCase() : "";

        boolean isIndia = country.contains("india") || country.contains("in") ||
                loc.contains("india") || loc.contains("bengaluru") || loc.contains("bangalore") ||
                loc.contains("hyderabad") || loc.contains("pune") || loc.contains("delhi") ||
                loc.contains("mumbai") || loc.contains("noida") || loc.contains("gurgaon") ||
                loc.contains("gurugram") || loc.contains("chennai") || loc.contains("remote");

        return isIndia;
    }

    private Optional<Job> findExistingJob(NormalizedJobDto dto) {
        if (dto.getSourceJobId() != null && !dto.getSourceJobId().isEmpty()) {
            Optional<Job> byId = jobRepository.findBySourceAndSourceJobId(dto.getSource(), dto.getSourceJobId());
            if (byId.isPresent()) return byId;
        }

        // Fuzzy match by company + title + location
        String cleanTitle = dto.getTitle().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        List<Job> potential = jobRepository.findByCompanyIgnoreCase(dto.getCompany().trim());
        for (Job p : potential) {
            String existingCleanTitle = p.getTitle().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            if (cleanTitle.equals(existingCleanTitle)) {
                return Optional.of(p);
            }
        }

        return Optional.empty();
    }

    private void deactivateExpiredJobs() {
        List<Job> activeJobs = jobRepository.findByIsActiveTrue();
        LocalDateTime now = LocalDateTime.now();
        for (Job job : activeJobs) {
            if (job.getDeadline() != null && job.getDeadline().isBefore(now)) {
                job.setIsActive(false);
                jobRepository.save(job);
                log.info("Deactivated expired job: {} at {}", job.getTitle(), job.getCompany());
            }
        }
    }

    public List<ProviderStatusDto> getProviderStatuses() {
        List<ProviderStatusDto> list = new ArrayList<>();
        for (JobProvider provider : providers) {
            list.add(new ProviderStatusDto(
                    provider.getSourceName().name(),
                    provider.getProviderStatus(),
                    provider.getStatusMessage(),
                    provider.getLastSuccessfulSync(),
                    provider.getLastError(),
                    provider.getJobCount()
            ));
        }
        return list;
    }
}

package com.careerai.controller;

import com.careerai.dto.*;
import com.careerai.service.JobIngestionService;
import com.careerai.service.JobService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final JobIngestionService jobIngestionService;

    public JobController(JobService jobService, JobIngestionService jobIngestionService) {
        this.jobService = jobService;
        this.jobIngestionService = jobIngestionService;
    }

    /**
     * Search and browse real active jobs with server-side pagination and filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<JobDto>>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) String remoteType,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Double salary,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Integer postedWithinDays,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        JobSearchCriteria criteria = new JobSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setLocation(location);
        criteria.setEmploymentType(employmentType);
        criteria.setExperienceLevel(experienceLevel);
        criteria.setCategory(category);
        criteria.setAcademicYear(academicYear);
        criteria.setGraduationYear(graduationYear);
        criteria.setRemoteType(remoteType);
        criteria.setCompany(company);
        criteria.setMinSalary(salary);
        criteria.setSource(source);
        criteria.setPostedWithinDays(postedWithinDays);

        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, Math.min(50, Math.max(1, size)), Sort.by(dir, sortBy));

        PageResponse<JobDto> result = jobService.searchJobs(criteria, pageable);
        return ResponseEntity.ok(ApiResponse.success("Active real jobs retrieved successfully", result));
    }

    /**
     * Get single job details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(@PathVariable Long id) {
        JobDto job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success("Job retrieved successfully", job));
    }

    /**
     * Get tailored active jobs matching the student's uploaded resume with match score and skill gaps.
     */
    @GetMapping("/matched")
    public ResponseEntity<ApiResponse<List<JobMatchDto>>> getMatchedJobs(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(ApiResponse.success("No authenticated student", List.of()));
        }
        String email = authentication.getName();
        List<JobMatchDto> matchedJobs = jobService.getMatchedJobsForUser(email);
        return ResponseEntity.ok(ApiResponse.success("Matched active jobs retrieved successfully", matchedJobs));
    }

    /**
     * Provider health and status endpoint. Shows which providers are ACTIVE and which are NOT_CONFIGURED.
     * Zero credentials or API secrets exposed.
     */
    @GetMapping("/providers/status")
    public ResponseEntity<ApiResponse<List<ProviderStatusDto>>> getProviderStatus() {
        List<ProviderStatusDto> statuses = jobIngestionService.getProviderStatuses();
        return ResponseEntity.ok(ApiResponse.success("Provider status retrieved", statuses));
    }

    /**
     * Manual trigger for job synchronization across active providers.
     */
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerSync() {
        Map<String, Object> summary = jobIngestionService.syncAllProviders();
        return ResponseEntity.ok(ApiResponse.success("Job sync pipeline completed", summary));
    }
}

package com.careerai.controller;

import com.careerai.dto.ApiResponse;
import com.careerai.dto.JobApplicationDto;
import com.careerai.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<ApiResponse<JobApplicationDto>> applyToJob(
            Authentication authentication,
            @PathVariable Long jobId,
            @RequestParam(value = "platform", required = false, defaultValue = "Direct Portal") String platform) {
        String email = authentication.getName();
        JobApplicationDto appDto = jobApplicationService.applyToJob(email, jobId, platform);
        return ResponseEntity.ok(ApiResponse.success("Application recorded successfully", appDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobApplicationDto>>> getUserApplications(Authentication authentication) {
        String email = authentication.getName();
        List<JobApplicationDto> apps = jobApplicationService.getUserApplications(email);
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved successfully", apps));
    }

    @GetMapping("/applied-job-ids")
    public ResponseEntity<ApiResponse<List<Long>>> getAppliedJobIds(Authentication authentication) {
        String email = authentication.getName();
        List<Long> ids = jobApplicationService.getUserAppliedJobIds(email);
        return ResponseEntity.ok(ApiResponse.success("Applied job IDs retrieved successfully", ids));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getApplicationCount(Authentication authentication) {
        String email = authentication.getName();
        long count = jobApplicationService.getApplicationCount(email);
        return ResponseEntity.ok(ApiResponse.success("Application count retrieved", count));
    }
}

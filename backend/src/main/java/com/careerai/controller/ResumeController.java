package com.careerai.controller;

import com.careerai.dto.ApiResponse;
import com.careerai.dto.AtsTailoredResumeDto;
import com.careerai.dto.CustomTailorRequest;
import com.careerai.dto.ResumeResponseDto;
import com.careerai.service.AtsResumeGeneratorService;
import com.careerai.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final AtsResumeGeneratorService atsResumeGeneratorService;

    public ResumeController(ResumeService resumeService, AtsResumeGeneratorService atsResumeGeneratorService) {
        this.resumeService = resumeService;
        this.atsResumeGeneratorService = atsResumeGeneratorService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String email = authentication.getName();
        ResumeResponseDto resumeDto = resumeService.uploadResume(email, file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded and parsed successfully", resumeDto));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> getMyResume(Authentication authentication) {
        String email = authentication.getName();
        return resumeService.getResumeByEmail(email)
                .map(dto -> ResponseEntity.ok(ApiResponse.success("Resume retrieved successfully", dto)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success("No resume uploaded yet", null)));
    }

    @PostMapping("/tailor/{jobId}")
    public ResponseEntity<ApiResponse<AtsTailoredResumeDto>> tailorResumeForJob(
            Authentication authentication,
            @PathVariable Long jobId) {
        String email = authentication.getName();
        AtsTailoredResumeDto tailoredDto = atsResumeGeneratorService.generateAtsResumeForJob(email, jobId);
        return ResponseEntity.ok(ApiResponse.success("ATS tailored resume generated successfully", tailoredDto));
    }

    @PostMapping("/tailor-custom")
    public ResponseEntity<ApiResponse<AtsTailoredResumeDto>> tailorResumeCustom(
            Authentication authentication,
            @RequestBody CustomTailorRequest request) {
        String email = authentication.getName();
        AtsTailoredResumeDto tailoredDto = atsResumeGeneratorService.generateAtsResumeCustom(
                email,
                request.getJobTitle(),
                request.getCompany(),
                request.getJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success("ATS tailored resume generated successfully", tailoredDto));
    }
}


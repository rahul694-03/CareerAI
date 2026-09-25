package com.careerai.service;

import com.careerai.dto.JobApplicationDto;
import com.careerai.entity.Job;
import com.careerai.entity.JobApplication;
import com.careerai.entity.User;
import com.careerai.exception.ResourceNotFoundException;
import com.careerai.repository.JobApplicationRepository;
import com.careerai.repository.JobRepository;
import com.careerai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
                                 JobRepository jobRepository,
                                 UserRepository userRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public JobApplicationDto applyToJob(String userEmail, Long jobId, String platform) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        Optional<JobApplication> existingApp = jobApplicationRepository.findByUserAndJob(user, job);
        if (existingApp.isPresent()) {
            JobApplication app = existingApp.get();
            if (platform != null && !platform.isBlank()) {
                app.setPlatform(platform);
                app = jobApplicationRepository.save(app);
            }
            return mapToDto(app);
        }

        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setJob(job);
        application.setStatus("APPLIED");
        application.setPlatform(platform != null && !platform.isBlank() ? platform : "Direct Portal");

        JobApplication saved = jobApplicationRepository.save(application);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getUserApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return jobApplicationRepository.findByUserOrderByAppliedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Long> getUserAppliedJobIds(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return jobApplicationRepository.findByUserOrderByAppliedAtDesc(user).stream()
                .map(app -> app.getJob().getId())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getApplicationCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return jobApplicationRepository.countByUser(user);
    }

    private JobApplicationDto mapToDto(JobApplication app) {
        Job job = app.getJob();
        return new JobApplicationDto(
                app.getId(),
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getWorkplaceType(),
                job.getJobType(),
                job.getSalaryRange(),
                job.getApplyUrl(),
                app.getPlatform() != null ? app.getPlatform() : "Direct Portal",
                app.getStatus(),
                app.getAppliedAt()
        );
    }
}
